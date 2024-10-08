#!/bin/bash

. ./.env.development.local
[ -z "$NPM_CONFIG_REGISTRY" ] && NPM_CONFIG_REGISTRY='https://registry.npmjs.org'
export NPM_CONFIG_REGISTRY
bun i
