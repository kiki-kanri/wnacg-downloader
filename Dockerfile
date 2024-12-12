# Build stage
FROM oven/bun:alpine AS build-stage

## Set args, envs and workdir
ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=$NPM_CONFIG_REGISTRY
WORKDIR /app

## Install dependencies
COPY ./bun.lockb ./package.json ./
RUN bun i --frozen-lockfile

## Set production env
ENV NODE_ENV=production

## Copy files
COPY ./src ./src
COPY ./eslint.config.mjs ./tsconfig.json ./

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
