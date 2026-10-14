#!/usr/bin/env bash
#
# Build the encrypted Ansible vault from the values that are live on the VPS
#
# Pulls /srv/app/production/.env and .env.production, extracts the secrets,
# generates a logs UI credential, and writes the encrypted group_vars vault.
# Read-only on the server
#
#   ansible/scripts/import-vault.sh
#
# The vault password lives in ansible/.vault_pass (git-ignored); this script
# creates it on first run and prints it, so store it somewhere safe. Connection
# details come from ansible/inventory/hosts.yml, or the VPS_HOST / VPS_USER /
# VPS_KEY environment variables

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ansible_dir="$repo_root/ansible"
inventory="$ansible_dir/inventory/hosts.yml"
vault_file="$ansible_dir/inventory/group_vars/all/vault.yml"
vault_pass_file="$ansible_dir/.vault_pass"

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
KEY="${KEY:-$HOME/.ssh/id_ed25519}"
[ -n "$HOST" ] || { echo "no host: set VPS_HOST or provide inventory/hosts.yml" >&2; exit 2; }
[ -n "$USER" ] || { echo "no user: set VPS_USER or provide inventory/hosts.yml" >&2; exit 2; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
ssh_opts=(-i "$KEY" -o StrictHostKeyChecking=accept-new)

echo "Pulling live env from ${USER}@${HOST} ..."
scp "${ssh_opts[@]}" "${USER}@${HOST}:/srv/app/production/.env"             "$tmp/env"           >/dev/null
scp "${ssh_opts[@]}" "${USER}@${HOST}:/srv/app/production/.env.production" "$tmp/env.production" >/dev/null

# The env files are plain KEY=value; sourcing them is the least fussy parse
set -a
# shellcheck disable=SC1091
. "$tmp/env"
# shellcheck disable=SC1091
. "$tmp/env.production"
set +a

if [ ! -f "$vault_pass_file" ]; then
  umask 077
  openssl rand -base64 32 >"$vault_pass_file"
  echo "==> generated $vault_pass_file"
  echo "    vault password: $(cat "$vault_pass_file")"
fi

logs_pass="$(openssl rand -base64 18)"
logs_hash="$(openssl passwd -apr1 "$logs_pass")"

cat >"$vault_file.plain" <<EOF
vault_postgres_password: "${POSTGRES_PASSWORD:?missing POSTGRES_PASSWORD}"
vault_jwt_secret: "${JWT_SECRET:?missing JWT_SECRET}"
vault_resend_api_key: "${RESEND_API_KEY:?missing RESEND_API_KEY}"
vault_s3_access_key: "${S3_ACCESS_KEY:?missing S3_ACCESS_KEY}"
vault_s3_access_secret: "${S3_ACCESS_SECRET:?missing S3_ACCESS_SECRET}"
vault_nginx_logs_htpasswd: "logs:${logs_hash}"
EOF

ansible-vault encrypt \
  --vault-password-file "$vault_pass_file" \
  --output "$vault_file" \
  "$vault_file.plain"
rm -f "$vault_file.plain"

echo
echo "Wrote $vault_file (encrypted)."
echo "Logs UI credential: user 'logs', password '${logs_pass}'"
echo "Back up both the vault password and this credential."
