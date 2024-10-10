#!/bin/bash

pnpm upgrade -L --lockfile-only
bun i
bun update
