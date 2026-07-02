# Base node image
FROM node:18-alpine AS base

# Stage 1: Prune the monorepo for the target app
FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
ARG APP_NAME
RUN turbo prune --scope=$APP_NAME --docker

# Stage 2: Install dependencies & build the app
FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (to cache this layer)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm ci

# Copy the rest of the source code and build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ARG APP_NAME
ENV APP_NAME=$APP_NAME
RUN npx turbo run build --filter=$APP_NAME

# Prune dev dependencies for a smaller production image
RUN npm prune --omit=dev

# Stage 3: Clean production runner
FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

# Copy pruned built project
COPY --from=installer --chown=nestjs:nodejs /app .

# Define execution command using environment variable
ARG APP_NAME
ENV APP_NAME=$APP_NAME
CMD node apps/$APP_NAME/dist/main
