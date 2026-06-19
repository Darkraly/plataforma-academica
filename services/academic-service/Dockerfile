FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

FROM node:20-alpine
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER appuser
ENV NODE_ENV=production
ENV PORT=3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1
EXPOSE 3002
CMD ["node", "src/server.js"]
