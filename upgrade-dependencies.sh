#!/bin/bash

set -e
pnpm upgrade -L --lockfile-only
bun i
bun update
./modify-files-permissions.sh
