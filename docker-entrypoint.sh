#!/bin/sh

set -e
if [ -d /run/secrets ]; then
    for secret_file_path in /run/secrets/*; do
        [ ! -f "$secret_file_path" ] && continue
        secret_key=$(basename "$secret_file_path")
        secret_value=$(cat "$secret_file_path")
        export "${secret_key}"="${secret_value}"
    done
fi

exec bun run ./index.js
