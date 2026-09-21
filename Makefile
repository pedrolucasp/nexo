# Deployment helpers
#
# Day-to-day app deploys happen in GitHub Actions
# (.github/workflows/deploy.yml) These targets are for the host-config work,
# which is done rarely

SHELL := bash
ANSIBLE_DIR := ansible
INVENTORY := inventory/hosts.yml

.PHONY: help deploy-diff deploy-check provision cert deploy-nginx

help:
	@echo "make deploy-diff    # pull live configs and diff them against the repo"
	@echo "make deploy-check   # ansible --check --diff (dry run, no changes)"
	@echo "make provision      # full host bootstrap (setup + deploy + cert + app)"
	@echo "make deploy-nginx   # publish the nginx vhost (deploy.yml)"
	@echo "make cert           # install uacme / manage certificates (cert.yml)"

deploy-diff:
	$(ANSIBLE_DIR)/scripts/pull-live-configs.sh

deploy-check:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) provision.yml --check --diff

provision:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) provision.yml --ask-become-pass

cert:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) cert.yml --ask-become-pass

deploy-nginx:
	cd $(ANSIBLE_DIR) && ansible-playbook -i $(INVENTORY) deploy.yml --ask-become-pass
