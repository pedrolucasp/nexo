#!/usr/bin/env bash
#
# Pull the live deployment configs from the VPS and diff them against the repo
# Read-only on the server. Exits non-zero if anything has drifted
#
# INTERNAL tool, run locally (or via `make deploy-diff`). It is deliberately
# not wired into CI: it is more useful interactively than as a scheduled job
#
#   ansible/scripts/pull-live-configs.sh
#
# Connection details are read from ansible/inventory/hosts.yml (git-ignored), or
# from the VPS_HOST / VPS_USER / VPS_KEY environment variables

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ansible_dir="$repo_root/ansible"
inventory="$ansible_dir/inventory/hosts.yml"

# first value of a key in the (flat) inventory
field() { awk -F': *' -v k="^[[:space:]]*$1" '$0 ~ k {print $2; exit}' "$inventory"; }

HOST="${VPS_HOST:-}"
USER="${VPS_USER:-}"
KEY="${VPS_KEY:-}"

if [ -f "$inventory" ]; then
  [ -n "$HOST" ] || HOST="$(field 'ansible_host:')"
  [ -n "$USER" ] || USER="$(field 'ansible_user:')"
  [ -n "$KEY" ]  || KEY="$(field 'ansible_ssh_private_key_file:')"
fi

KEY="${KEY/#\~/$HOME}"
[ -n "$HOST" ] || { echo "no host: set VPS_HOST or provide ansible/inventory/hosts.yml" >&2; exit 2; }
[ -n "$USER" ] || { echo "no user: set VPS_USER or provide ansible/inventory/hosts.yml" >&2; exit 2; }
KEY="${KEY:-$HOME/.ssh/id_ed25519}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# First vhost from vars/vhosts.yml, e.g. "usenexo.xyz"
vhost="$(awk '/^vhosts:/{f=1;next} f&&/^[[:space:]]*- /{print $2; exit}' "$ansible_dir/vars/vhosts.yml")"
[ -n "$vhost" ] || { echo "could not determine vhost from vars/vhosts.yml" >&2; exit 2; }

ssh_opts=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

echo "Pulling live configs from ${USER}@${HOST} ..."

pull() { # <remote path> <local name>
  if ssh "${ssh_opts[@]}" "${USER}@${HOST}" "cat '$1'" >"$tmp/$2" 2>/dev/null; then
    echo "  pulled $1"
  else
    echo "  MISSING on server: $1" >&2
    rm -f "$tmp/$2"
  fi
}

pull "/etc/nginx/http.d/${vhost}.conf"    nginx.conf
pull /srv/app/production/docker-compose.yml docker-compose.yml
pull /srv/app/production/valkey.conf        valkey.conf

# The nginx config is templated; render it the same way the nginx role would
render_nginx() {
  sed \
    -e "s/{{ vhosts\[0\] }}/${vhost}/g" \
    -e 's/{{ nginx_cert_dir }}/\/etc\/ssl\/uacme/g' \
    -e 's/{{ nginx_static_root }}/\/srv\/static/g' \
    -e 's/{{ nginx_proxy_pass }}/http:\/\/127.0.0.1:3000/g' \
    "$ansible_dir/roles/nginx/templates/site.https.j2"
}

status=0

report() { # <diff exit status> <label>
  if [ "$1" -eq 0 ]; then
    echo "ok   $2"
  else
    echo "DRIFT $2"; status=1
  fi
}

show_diff() { # <expected file> <live file>
  diff -u "$1" "$2" | sed 's/^/     /' || true
}

echo
if [ -f "$tmp/nginx.conf" ]; then
  render_nginx >"$tmp/nginx.expected"
  if diff -q "$tmp/nginx.expected" "$tmp/nginx.conf" >/dev/null; then
    report 0 "nginx server block"
  else
    report 1 "nginx server block"; show_diff "$tmp/nginx.expected" "$tmp/nginx.conf"
  fi
else
  echo "??   nginx server block — no live copy"
fi

for pair in \
  "ansible/roles/app/files/docker-compose.production.yml:docker-compose.yml:production compose" \
  "ansible/roles/app/files/valkey.conf:valkey.conf:valkey config"; do
  IFS=: read -r repo_rel live name <<<"$pair"
  if [ ! -f "$tmp/$live" ]; then
    echo "??   $name — no live copy"
  elif diff -q "$repo_root/$repo_rel" "$tmp/$live" >/dev/null; then
    report 0 "$name"
  else
    report 1 "$name"; show_diff "$repo_root/$repo_rel" "$tmp/$live"
  fi
done

echo
if [ "$status" -eq 0 ]; then
  echo "No drift."
else
  echo "Drift detected: re-run the matching playbook (deploy.yml / app.yml)"
fi
exit "$status"
