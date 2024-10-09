#!/bin/sh

export NODE_ENV=production

case "$*" in
*--clean*)
	rm -rf ./dist
	;;
esac

bun run build:exec --outdir ./dist ./src/index.ts &&
	bunx ts-project-builder ./dist/index.js -f esm --minify || exit 1

case "$*" in
*--compile*)
	bun run build:exec --bytecode --compile --outfile ./dist/index ./dist/index.mjs
	;;
*)
	bun run build:exec --bytecode --outdir ./dist ./dist/index.mjs
	;;
esac
