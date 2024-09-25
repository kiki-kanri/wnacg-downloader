#!/bin/bash

. ./.env.development.local
[ -z "$NPM_REGISTRY" ] && NPM_REGISTRY='https://registry.npmjs.org'
export NPM_REGISTRY
pnpm upgrade -L --lockfile-only
bun i
bun update
