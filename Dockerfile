# Build stage
FROM oven/bun:alpine AS build-stage

## Set args, envs and workdir
ARG NPM_CONFIG_REGISTRY
ENV NODE_ENV=production
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY
WORKDIR /app

## Install dependencies
COPY ./bun.lockb ./package.json ./
RUN bun i --frozen-lockfile

## Copy files
COPY ./src ./src
COPY ./.env.production.local ./eslint.config.mjs ./tsconfig.json ./

## Build
RUN bun run lint
RUN bun run type-check
RUN bun run build

# Runtime stage
FROM oven/bun:alpine

## Set envs and workdir
ENV NODE_ENV=production
WORKDIR /app

## Upgrade packages and set timezone
RUN apk update && apk upgrade --no-cache
# RUN apk add -lu --no-cache tzdata && ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

## Copy files and libraries
COPY --from=build-stage /app/dist ./
COPY ./.env.production.local ./.env

## Set cmd
CMD ["bun", "run", "./index.js"]
