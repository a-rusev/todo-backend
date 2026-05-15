# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 – "builder"
#   • Installs ALL dependencies (including devDependencies needed for tsc)
#   • Compiles TypeScript → dist/
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Good practice: set a working directory inside the image
WORKDIR /app

# Copy package files first so Docker can cache the npm install layer.
# If package.json / package-lock.json haven't changed, Docker reuses the
# cached layer and skips re-downloading node_modules on every rebuild.
COPY package.json package-lock.json ./

# Install every dependency (prod + dev) — we need tsc from devDependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Compile TypeScript → JavaScript (output lands in dist/)
RUN npm run build

RUN npm prune --omit=dev

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 – "runner" (for production)
#   • Starts from a fresh, minimal image (no source code, no devDependencies)
#   • Only copies the compiled output and production node_modules
#   • Result: a much smaller final image (~3× smaller than keeping devDeps)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only production dependencies from the builder stage
COPY package.json package-lock.json ./

RUN npm ci --omit=dev

# Copy compiled JavaScript output
COPY --from=builder /app/dist ./dist

EXPOSE 3005

USER node

CMD ["node", "dist/index.js"]

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 – "dev" (for local development with hot-reload)
#   • Keeps all dependencies (prod + dev)
#   • Source code mounted via docker-compose.override.yml
#   • Runs nodemon for automatic restarts on code changes
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

EXPOSE 3005

USER node

CMD ["npm", "run", "dev"]
