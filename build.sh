#!/bin/bash

export NODE_ENV=production

[[ "$*" == *'--clean'* ]] && rm -rf ./dist

bun run build:exec --outdir ./dist ./src/index.ts &&
	bunx ts-project-builder ./dist/index.js -f esm --minify || exit 1

if [[ "$*" == *'--compile'* ]]; then
	bun run build:exec --bytecode --compile --outfile ./dist/index ./dist/index.mjs
else
	bun run build:exec --bytecode --outdir ./dist ./dist/index.mjs
fi
