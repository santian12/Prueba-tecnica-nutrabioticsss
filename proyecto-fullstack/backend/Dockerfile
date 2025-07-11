# ===================================================================
# DOCKERFILE PARA BACKEND FLASK - MICROSERVICIOS
# Sistema de Gestión de Proyectos Nutrabiotics
# ===================================================================

FROM python:3.11-slim

# Metadatos
LABEL maintainer="Nutrabiotics Dev Team"
LABEL version="1.0.0"
LABEL description="Backend Flask con arquitectura de microservicios"

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Crear directorio para uploads
RUN mkdir -p /app/uploads && chown appuser:appuser /app/uploads

# Copiar código fuente
COPY . .

# Cambiar propietario de los archivos
RUN chown -R appuser:appuser /app

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Comando por defecto
CMD ["python", "app.py"]
