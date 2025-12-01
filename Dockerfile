# Multi-stage build for optimized production image

# Stage 1: Build frontend and backend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install --legacy-peer-deps
RUN cd client && npm install --legacy-peer-deps
RUN cd server && npm install --legacy-peer-deps

# Copy source code
COPY client ./client
COPY server ./server
COPY content ./content

# Build frontend and backend
RUN cd client && npm run build
RUN cd server && npm run build

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package*.json ./server/
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/content ./content

# Create data directory for leads
RUN mkdir -p /app/data

# Set working directory to server
WORKDIR /app/server

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set environment to production
ENV NODE_ENV=production

# Start server
CMD ["node", "dist/index.js"]
