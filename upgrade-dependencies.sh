#!/bin/bash

. ./.env.development.local
[ -z "$NPM_CONFIG_REGISTRY" ] && NPM_CONFIG_REGISTRY='https://registry.npmjs.org'
export NPM_CONFIG_REGISTRY
pnpm upgrade -L --lockfile-only
bun i
bun update
