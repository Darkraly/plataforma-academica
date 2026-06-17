# ========== Stage 1: Build ==========
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar apenas package files primeiro (cache de dependências)
COPY package*.json ./

# Instalar todas as dependências (incluindo dev para build)
RUN npm ci --only=production && npm cache clean --force

# ========== Stage 2: Production ==========
FROM node:20-alpine

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copiar node_modules do builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Mudar para usuário não-root
USER appuser

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "src/server.js"]
