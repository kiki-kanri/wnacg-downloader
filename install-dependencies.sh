#!/bin/bash

. ./.env.development.local
[ -z "$NPM_REGISTRY" ] && NPM_REGISTRY='https://registry.npmjs.org'
export NPM_REGISTRY
bun i
