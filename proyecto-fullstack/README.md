# 🧬 Sistema de Gestión de Proyectos - Nutrabiotics

Sistema completo de gestión de proyectos desarrollado con arquitectura de microservicios, diseñado para optimizar la productividad y colaboración en equipos de desarrollo.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Status](https://img.shields.io/badge/status-production-green.svg)
![License](https://img.shields.io/badge/license-MIT-yellow.svg)

## 📋 Tabla de Contenidos

- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📋 Prerrequisitos](#-prerrequisitos)
- [🛠️ Instalación](#️-instalación)
- [🎯 Funcionalidades](#-funcionalidades)
- [🌐 URLs y Accesos](#-urls-y-accesos)
- [👥 Usuarios de Prueba](#-usuarios-de-prueba)
- [🔧 Comandos Útiles](#-comandos-útiles)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔧 Configuración Avanzada](#-configuración-avanzada)
- [🐛 Solución de Problemas](#-solución-de-problemas)
- [📚 Documentación de API](#-documentación-de-api)

## 🏗️ Arquitectura

El sistema utiliza una arquitectura moderna de microservicios con contenedores Docker:

### Stack Tecnológico

#### Frontend
- **Next.js 14** - Framework React con SSR/SSG
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de utilidades CSS
- **Shadcn/ui** - Componentes de UI modernos
- **Recharts** - Visualización de datos y gráficos
- **Lucide React** - Iconos vectoriales

#### Backend
- **Flask** - Framework web minimalista de Python
- **SQLAlchemy** - ORM para base de datos
- **Flask-JWT-Extended** - Autenticación JWT
- **Flask-CORS** - Manejo de CORS
- **Marshmallow** - Serialización/deserialización
- **ReportLab** - Generación de PDFs

#### Base de Datos
- **PostgreSQL 15** - Base de datos relacional robusta
- **Redis** (opcional) - Cache y sesiones

#### DevOps
- **Docker** - Contenedorización
- **Docker Compose** - Orquestación de servicios
- **Nginx** - Proxy reverso (opcional)

### Arquitectura de Microservicios

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│    (Flask)      │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd proyecto-fullstack

# 2. Iniciar todos los servicios
docker-compose up --build

# 3. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Opción 2: Desarrollo Local

```bash
# 1. Clonar repositorio
git clone <repository-url>
cd proyecto-fullstack

# 2. Configurar Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py

# 3. Configurar Frontend (nueva terminal)
cd frontend
npm install
npm run dev
```

## 📋 Prerrequisitos

### Para Docker (Opción Recomendada)
- ✅ **Docker Desktop** (versión 20.10+)
- ✅ **Git**
- ✅ **4GB RAM** mínimo
- ✅ **10GB espacio libre** en disco

### Para Desarrollo Local
- ✅ **Python 3.11+**
- ✅ **Node.js 18+**
- ✅ **PostgreSQL 14+**
- ✅ **Git**

## 🛠️ Instalación

### Instalación con Docker

#### Paso 1: Verificar Docker
```bash
docker --version
docker-compose --version
```

#### Paso 2: Clonar y Configurar
```bash
git clone <repository-url>
cd proyecto-fullstack
```

#### Paso 3: Variables de Entorno (Opcional)
```bash
# Crear archivo .env para personalización
cp .env.example .env
```

#### Paso 4: Iniciar Sistema
```bash
# Construcción inicial (primera vez)
docker-compose up --build

# Ejecución en segundo plano
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### Instalación Local (Desarrollo)

#### Backend

1. **Configurar Python**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

2. **Instalar Dependencias**
```bash
pip install -r requirements.txt
```

3. **Configurar PostgreSQL**
```sql
-- Crear base de datos
CREATE DATABASE nutrabiotics_db;
CREATE USER nutrabiotics_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE nutrabiotics_db TO nutrabiotics_user;
```

4. **Configurar Variables de Entorno**
```bash
# Crear archivo .env
DATABASE_URL=postgresql://nutrabiotics_user:password123@localhost:5432/nutrabiotics_db
JWT_SECRET_KEY=tu-clave-secreta-aqui
FLASK_ENV=development
```

5. **Inicializar Base de Datos**
```bash
python -c "from app import app, db; app.app_context().push(); db.create_all()"
python seed_data.py
```

6. **Ejecutar Backend**
```bash
python app.py
```

#### Frontend

1. **Instalar Node.js Dependencies**
```bash
cd frontend
npm install
```

2. **Configurar Variables de Entorno**
```bash
# Crear .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Nutrabiotics
```

3. **Ejecutar Frontend**
```bash
npm run dev
```

## 🎯 Funcionalidades

### 📊 Dashboard Ejecutivo
- **Métricas en Tiempo Real**: KPIs de proyectos y productividad
- **Gráficos Interactivos**: Visualización de datos con Recharts
- **Alertas y Notificaciones**: Sistema de notificaciones en tiempo real
- **Vista General**: Resumen de proyectos activos y tareas pendientes

### 🗂️ Gestión de Proyectos
- **CRUD Completo**: Crear, leer, actualizar y eliminar proyectos
- **Asignación de Equipos**: Gestión de miembros y roles
- **Estados de Proyecto**: Planificación, En desarrollo, Testing, Completado
- **Fechas y Deadlines**: Gestión de cronogramas y hitos
- **Documentos**: Subida y gestión de archivos de proyecto

### ✅ Sistema de Tareas
- **Gestión Avanzada**: Creación, asignación y seguimiento de tareas
- **Estados Dinámicos**: Pendiente, En progreso, En revisión, Completada
- **Prioridades**: Baja, Media, Alta, Crítica
- **Dependencias**: Tareas dependientes y prerequisitos
- **Comentarios**: Sistema de comentarios y actualizaciones
- **Time Tracking**: Seguimiento de tiempo invertido

### 👥 Gestión de Usuarios
- **Autenticación Segura**: Sistema JWT con refresh tokens
- **Roles y Permisos**: Admin, Manager, Developer, Viewer
- **Perfiles Detallados**: Información personal y profesional
- **Gestión de Equipos**: Creación y administración de equipos
- **Histórial de Actividad**: Log de acciones de usuario

### 📈 Reportes y Analíticas
- **Reportes PDF**: Generación automática de reportes
- **Métricas de Productividad**: Análisis de rendimiento
- **Estadísticas de Proyectos**: Progreso y métricas clave
- **Exportación de Datos**: CSV, Excel, PDF
- **Dashboards Personalizables**: Widgets configurables

### 🔐 Seguridad
- **Autenticación JWT**: Tokens seguros con expiración
- **Autorización por Roles**: Control de acceso granular
- **Validación de Datos**: Sanitización de entradas
- **Audit Trail**: Registro de todas las acciones
- **Rate Limiting**: Protección contra ataques DDoS

## 🌐 URLs y Accesos

### Producción (Docker)
- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔧 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🗄️ **Base de Datos**: `localhost:5432`
- 📊 **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

### Desarrollo Local
- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔧 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🗄️ **PostgreSQL**: `localhost:5432`

## 👥 Usuarios de Prueba

El sistema incluye usuarios de prueba para todas las funcionalidades:

| Rol | Email | Contraseña | Permisos |
|-----|-------|------------|----------|
| **Admin** | admin@nutrabiotics.com | admin123 | Acceso completo al sistema |
| **Manager** | maria@nutrabiotics.com | manager123 | Gestión de proyectos y equipos |
| **Developer** | juan@nutrabiotics.com | dev123 | Gestión de tareas y desarrollo |

### Datos de Prueba Incluidos
- ✅ **3 Proyectos** de ejemplo con diferentes estados
- ✅ **15 Tareas** distribuidas entre proyectos
- ✅ **5 Usuarios** con diferentes roles
- ✅ **Métricas** y datos históricos para dashboards

## 🔧 Comandos Útiles

### Docker Compose

```bash
# 🚀 Iniciar servicios
docker-compose up

# 🔨 Construir e iniciar
docker-compose up --build

# 🌙 Ejecutar en segundo plano
docker-compose up -d

# 📊 Ver logs de todos los servicios
docker-compose logs -f

# 📋 Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database

# 🔄 Reiniciar servicios
docker-compose restart

# ⏹️ Detener servicios
docker-compose down

# 🧹 Limpiar completamente (incluye volúmenes)
docker-compose down -v

# 🔨 Reconstruir sin caché
docker-compose build --no-cache

# 📊 Ver estado de servicios
docker-compose ps

# 🔍 Acceder a un contenedor
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Desarrollo Local

```bash
# Backend
cd backend
python app.py                    # Ejecutar servidor
python seed_data.py             # Cargar datos de prueba
pip install -r requirements.txt # Instalar dependencias

# Frontend
cd frontend
npm run dev         # Servidor de desarrollo
npm run build       # Construir para producción
npm run start       # Ejecutar en producción
npm run lint        # Verificar código
npm run type-check  # Verificar tipos TypeScript
```

## 📁 Estructura del Proyecto

```
proyecto-fullstack/
├── 📁 backend/                     # Backend Flask
│   ├── 📁 routes/                  # Microservicios
│   │   ├── auth_routes.py          # Autenticación
│   │   ├── user_routes.py          # Gestión de usuarios
│   │   ├── project_routes.py       # Gestión de proyectos
│   │   ├── task_routes.py          # Gestión de tareas
│   │   ├── metrics_routes.py       # Métricas y estadísticas
│   │   └── pdf_routes.py           # Generación de PDFs
│   ├── 📁 models/                  # Modelos de base de datos
│   │   ├── user.py                 # Modelo Usuario
│   │   ├── project.py              # Modelo Proyecto
│   │   ├── task.py                 # Modelo Tarea
│   │   └── __init__.py             # Inicialización modelos
│   ├── 📁 utils/                   # Utilidades
│   │   ├── auth.py                 # Utilidades de autenticación
│   │   ├── validators.py           # Validadores
│   │   └── helpers.py              # Funciones auxiliares
│   ├── 📁 uploads/                 # Archivos subidos
│   ├── 📄 app.py                   # Aplicación principal
│   ├── 📄 database.py              # Configuración de BD
│   ├── 📄 seed_data.py             # Datos de prueba
│   ├── 📄 requirements.txt         # Dependencias Python
│   ├── 📄 Dockerfile               # Contenedor backend
│   └── 📄 .env.example             # Variables de entorno ejemplo
├── 📁 frontend/                    # Frontend Next.js
│   ├── 📁 components/              # Componentes React
│   │   ├── 📁 dashboard/           # Componentes del dashboard
│   │   ├── 📁 projects/            # Componentes de proyectos
│   │   ├── 📁 tasks/               # Componentes de tareas
│   │   ├── 📁 users/               # Componentes de usuarios
│   │   ├── 📁 ui/                  # Componentes UI base
│   │   └── 📁 layout/              # Componentes de layout
│   ├── 📁 pages/                   # Páginas Next.js
│   │   ├── 📁 api/                 # API routes (opcional)
│   │   ├── 📄 index.tsx            # Página principal
│   │   ├── 📄 dashboard.tsx        # Dashboard
│   │   ├── 📄 projects.tsx         # Proyectos
│   │   ├── 📄 tasks.tsx            # Tareas
│   │   └── 📄 users.tsx            # Usuarios
│   ├── 📁 utils/                   # Utilidades frontend
│   │   ├── 📄 api.ts               # Cliente API
│   │   ├── 📄 auth.ts              # Utilidades de auth
│   │   └── 📄 constants.ts         # Constantes
│   ├── 📁 styles/                  # Estilos CSS
│   ├── 📁 public/                  # Archivos estáticos
│   ├── 📄 package.json             # Dependencias Node.js
│   ├── 📄 tsconfig.json            # Configuración TypeScript
│   ├── 📄 tailwind.config.js       # Configuración Tailwind
│   ├── 📄 next.config.js           # Configuración Next.js
│   ├── 📄 Dockerfile               # Contenedor frontend
│   └── 📄 .env.example             # Variables de entorno ejemplo
├── 📄 docker-compose.yml           # Orquestación de servicios
├── 📄 .dockerignore                # Archivos ignorados por Docker
├── 📄 .gitignore                   # Archivos ignorados por Git
└── 📄 README.md                    # Este archivo
```

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (.env)
```bash
# Base de datos
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET_KEY=tu-clave-super-secreta-aqui
JWT_ACCESS_TOKEN_EXPIRES=3600

# Flask
FLASK_ENV=production
FLASK_DEBUG=False

# Archivos
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Email (opcional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-app
```

#### Frontend (.env.local)
```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:5000

# App
NEXT_PUBLIC_APP_NAME=Nutrabiotics
NEXT_PUBLIC_APP_VERSION=1.0.0

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

### Configuración de PostgreSQL

```sql
-- Configuración recomendada para producción
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Recargar configuración
SELECT pg_reload_conf();
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### Error: Puerto ya en uso
```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Detener Docker containers
docker-compose down

# Verificar containers activos
docker ps -a
```

#### Error: Base de datos no conecta
```bash
# Verificar estado de PostgreSQL
docker-compose logs database

# Recrear volumen de BD
docker-compose down -v
docker-compose up --build
```

#### Error: Frontend no compila
```bash
# Limpiar cache de Node.js
cd frontend
rm -rf node_modules
rm package-lock.json
npm install

# Verificar versión de Node.js
node --version  # Debe ser 18+
```

#### Error: Backend no inicia
```bash
# Verificar dependencias Python
cd backend
pip install -r requirements.txt

# Verificar variables de entorno
python -c "import os; print(os.environ.get('DATABASE_URL'))"
```

### Logs y Debugging

```bash
# Ver logs detallados
docker-compose logs -f --tail=100 backend
docker-compose logs -f --tail=100 frontend

# Acceder a container para debugging
docker-compose exec backend bash
docker-compose exec frontend sh

# Verificar salud de servicios
curl http://localhost:5000/health
curl http://localhost:3000
```

## 📚 Documentación de API

### Endpoints Principales

#### Autenticación
```bash
POST /auth/login          # Iniciar sesión
POST /auth/register       # Registrar usuario
POST /auth/logout         # Cerrar sesión
POST /auth/refresh        # Renovar token
GET  /auth/me             # Obtener usuario actual
```

#### Usuarios
```bash
GET    /users             # Listar usuarios
POST   /users             # Crear usuario
GET    /users/{id}        # Obtener usuario específico
PUT    /users/{id}        # Actualizar usuario
DELETE /users/{id}        # Eliminar usuario
```

#### Proyectos
```bash
GET    /projects          # Listar proyectos
POST   /projects          # Crear proyecto
GET    /projects/{id}     # Obtener proyecto
PUT    /projects/{id}     # Actualizar proyecto
DELETE /projects/{id}     # Eliminar proyecto
GET    /projects/{id}/tasks # Tareas del proyecto
```

#### Tareas
```bash
GET    /tasks             # Listar tareas
POST   /tasks             # Crear tarea
GET    /tasks/{id}        # Obtener tarea
PUT    /tasks/{id}        # Actualizar tarea
DELETE /tasks/{id}        # Eliminar tarea
POST   /tasks/{id}/comments # Agregar comentario
```

#### Métricas
```bash
GET /metrics/dashboard    # Métricas del dashboard
GET /metrics/projects     # Estadísticas de proyectos
GET /metrics/users        # Estadísticas de usuarios
GET /metrics/tasks        # Estadísticas de tareas
```

#### Reportes
```bash
POST /pdf/project-report  # Generar reporte de proyecto
POST /pdf/task-report     # Generar reporte de tareas
POST /pdf/user-report     # Generar reporte de usuario
```

### Ejemplo de Uso de API

```javascript
// Autenticación
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@nutrabiotics.com',
    password: 'admin123'
  })
});

const { token } = await response.json();

// Usar token en requests
const projects = await fetch('/projects', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🤝 Contribución

1. **Fork** el repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear **Pull Request**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico y consultas:

- 📧 **Email**: soporte@nutrabiotics.com
- 📖 **Documentación**: [Wiki del proyecto]
- 🐛 **Issues**: [GitHub Issues]
- 💬 **Discussions**: [GitHub Discussions]

---

**Desarrollado con ❤️ para Nutrabiotics**
