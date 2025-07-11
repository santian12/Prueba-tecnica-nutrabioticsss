# ===================================================================
# DOCKERFILE PARA FRONTEND NEXT.JS
# Sistema de Gestión de Proyectos Nutrabiotics
# ===================================================================

# Etapa 1: Construcción
FROM node:18-alpine AS builder

# Metadatos
LABEL maintainer="Nutrabiotics Dev Team"
LABEL version="1.0.0"
LABEL description="Frontend Next.js con TypeScript y Tailwind"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para el build)
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa 2: Producción
FROM node:18-alpine AS runner

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos necesarios desde builder
# Copiar public solo si existe
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copiar aplicación standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copiar archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar propietario
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Comando por defecto
CMD ["node", "server.js"]
