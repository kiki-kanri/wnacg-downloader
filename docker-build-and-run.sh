#!/bin/bash

. ./.env.production.local

name='bun-project'
user='user'
image_name="$user/$name:latest"

docker pull oven/bun:alpine
docker build "$@" -t "$image_name" --build-arg "NPM_REGISTRY=$NPM_REGISTRY" . || exit 1
[ "$(docker ps | grep "$name")" ] && docker kill "$name"
[ "$(docker ps -a | grep "$name")" ] && docker rm "$name"
docker run -itd --name "$name" --restart=always "$image_name"
