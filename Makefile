# Deployment helpers
#
# Day-to-day app deploys happen in GitHub Actions
# (.github/workflows/deploy.yml) These targets are for the host-config work,
# which is done rarely

SHELL := bash
ANSIBLE_DIR := ansible
INVENTORY := inventory/hosts.yml

# Only pass the vault password when it exists, so these targets keep working
# before the vault has been imported (scripts/import-vault.sh creates it)
VAULT_ARGS := $(shell [ -f $(ANSIBLE_DIR)/.vault_pass ] && echo --vault-password-file $(CURDIR)/$(ANSIBLE_DIR)/.vault_pass)

.PHONY: help deploy-diff deploy-check provision cert deploy-nginx app vault-import

help:
	@echo "make deploy-diff    # pull live configs and diff them against the repo"
	@echo "make deploy-check   # ansible --check --diff (dry run, no changes)"
	@echo "make provision      # full host bootstrap (setup + deploy + cert + app)"
	@echo "make deploy-nginx   # publish the nginx vhost (deploy.yml)"
	@echo "make app            # render the app config from the vault (app.yml)"
	@echo "make cert           # install uacme / manage certificates (cert.yml)"
	@echo "make vault-import   # build the encrypted vault from the live env files"

deploy-diff:
	$(ANSIBLE_DIR)/scripts/pull-live-configs.sh

vault-import:
	$(ANSIBLE_DIR)/scripts/import-vault.sh

deploy-check:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) $(VAULT_ARGS) provision.yml --check --diff

provision:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) $(VAULT_ARGS) provision.yml --ask-become-pass

cert:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) $(VAULT_ARGS) cert.yml --ask-become-pass

deploy-nginx:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) $(VAULT_ARGS) deploy.yml --ask-become-pass

app:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) $(VAULT_ARGS) app.yml --ask-become-pass
