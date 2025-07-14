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
- [🧪 Pruebas y Cobertura](#-pruebas-y-cobertura)
- [⚙️ Decisiones Técnicas](#️-decisiones-técnicas)
- [📖 Manual Básico de Usuario](#-manual-básico-de-usuario)
- [📦 Variables de Entorno](#-variables-de-entorno)
- [❓ FAQ y Troubleshooting](#-faq-y-troubleshooting)

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
## 🧪 Pruebas y Cobertura

El sistema incluye una batería de pruebas unitarias y de integración para backend (Flask) y frontend (Next.js).

### Ejecutar tests del backend (Flask)

```bash
cd backend
pytest --maxfail=1 --disable-warnings -v
# Para ver el coverage:
pytest --cov=services --cov=models --cov=routes --cov-report=term-missing
```

### Ejecutar tests del frontend (Next.js)

```bash
cd frontend
npm run test
# O para coverage:
npm run test -- --coverage
```

### Estructura de tests

- `backend/tests/models/` — Pruebas unitarias de modelos
- `backend/tests/services/` — Pruebas unitarias de servicios
- `backend/tests/routes/` — Pruebas de endpoints REST

### Buenas prácticas
- Uso de mocks para dependencias externas (DB, JWT, email)
- Cobertura de casos de éxito y error
- Organización profesional por tipo de lógica

### Ver el reporte de cobertura
Al ejecutar los comandos anteriores con `--cov`, se mostrará el porcentaje de cobertura y las líneas no cubiertas.

---

## ⚙️ Decisiones Técnicas

- **Arquitectura de microservicios**: Separación clara entre frontend, backend y base de datos, usando Docker para facilitar despliegue y escalabilidad.
- **Flask + SQLAlchemy**: Permite flexibilidad, integración rápida y ORM robusto.
- **JWT para autenticación**: Seguridad y escalabilidad para APIs modernas.
- **Next.js + Tailwind**: Permite SSR, SSG y una UI moderna y responsiva.
- **Mocks y tests**: Se priorizó la cobertura de lógica de negocio y endpoints críticos, usando mocks para dependencias externas.
- **Notificaciones por email**: Servicio desacoplado y preparado para integración con Brevo (SendinBlue) o cualquier proveedor SMTP.
- **Generación de PDFs**: Uso de ReportLab para reportes avanzados y personalizables.
- **Variables de entorno**: Toda configuración sensible y de entorno se gestiona por variables `.env`.

---

## 📖 Manual Básico de Usuario

### Acceso y autenticación
1. Ingresa a la URL del frontend (`http://localhost:3000`).
2. Haz clic en "Iniciar sesión" e ingresa tus credenciales.
3. Si no tienes cuenta, usa "Registrarse".

### Gestión de proyectos
1. Desde el dashboard, selecciona "Proyectos" en el menú lateral.
2. Haz clic en "Nuevo Proyecto" para crear uno.
3. Puedes editar, ver detalles o eliminar proyectos existentes.

### Gestión de tareas
1. Dentro de un proyecto, accede a la pestaña "Tareas".
2. Crea nuevas tareas, asígnalas a usuarios y cambia su estado.
3. Usa los filtros para ver tareas por estado, prioridad o responsable.

### Reportes y métricas
1. Accede a la sección "Reportes" para generar PDFs de proyectos, tareas o usuarios.
2. Visualiza métricas clave en el dashboard principal.

### Notificaciones
1. Recibe notificaciones en tiempo real sobre asignaciones, cambios y recordatorios.
2. Configura tu email para recibir notificaciones externas (si está habilitado).

### Perfil de usuario
1. Accede a tu perfil desde el menú superior derecho.
2. Actualiza tu información personal y cambia tu contraseña.

---

## 📦 Variables de Entorno

Ejemplo de archivos `.env.example` incluidos en `/backend` y `/frontend`:

### Backend (`backend/.env.example`)
```env
DATABASE_URL=postgresql://nutrabiotics_user:password123@localhost:5432/nutrabiotics_db
JWT_SECRET_KEY=tu-clave-secreta-aqui
FLASK_ENV=development
FLASK_DEBUG=True
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-app
```

### Frontend (`frontend/.env.example`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Nutrabiotics
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

**Recuerda copiar estos archivos a `.env` y `.env.local` y personalizar los valores según tu entorno.**

---

## ❓ FAQ y Troubleshooting

### Preguntas Frecuentes

- **¿No puedo iniciar sesión?**
  - Verifica tus credenciales o contacta a un admin.
- **¿No veo la opción de crear usuarios?**
  - Solo los roles Admin/Manager pueden gestionar usuarios.
- **¿Cómo restablezco mi contraseña?**
  - Usa la opción “¿Olvidaste tu contraseña?” en la pantalla de login.

### Troubleshooting

- **Error de conexión a base de datos:**
  - Revisa la variable `DATABASE_URL` y que el contenedor esté corriendo.
- **Problemas con dependencias:**
  - Ejecuta `npm install` o `pip install -r requirements.txt` según corresponda.
- **Error: Puerto ya en uso:**
  - Usa `netstat -ano | findstr :3000` o `:5000` para ver qué proceso lo ocupa.
- **Error: Backend no inicia:**
  - Verifica dependencias y variables de entorno.

---

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
## 🧪 Pruebas y Cobertura

El sistema incluye una batería de pruebas unitarias y de integración para backend (Flask) y frontend (Next.js).

### Ejecutar tests del backend (Flask)

```bash
cd backend
pytest --maxfail=1 --disable-warnings -v
# Para ver el coverage:
pytest --cov=services --cov=models --cov=routes --cov-report=term-missing
```

### Ejecutar tests del frontend (Next.js)

```bash
cd frontend
npm run test
# O para coverage:
npm run test -- --coverage
```

### Estructura de tests

- `backend/tests/models/` — Pruebas unitarias de modelos
- `backend/tests/services/` — Pruebas unitarias de servicios
- `backend/tests/routes/` — Pruebas de endpoints REST

### Buenas prácticas
- Uso de mocks para dependencias externas (DB, JWT, email)
- Cobertura de casos de éxito y error
- Organización profesional por tipo de lógica

### Ver el reporte de cobertura
Al ejecutar los comandos anteriores con `--cov`, se mostrará el porcentaje de cobertura y las líneas no cubiertas.

---

## ⚙️ Decisiones Técnicas

- **Arquitectura de microservicios**: Separación clara entre frontend, backend y base de datos, usando Docker para facilitar despliegue y escalabilidad.
- **Flask + SQLAlchemy**: Permite flexibilidad, integración rápida y ORM robusto.
- **JWT para autenticación**: Seguridad y escalabilidad para APIs modernas.
- **Next.js + Tailwind**: Permite SSR, SSG y una UI moderna y responsiva.
- **Mocks y tests**: Se priorizó la cobertura de lógica de negocio y endpoints críticos, usando mocks para dependencias externas.
- **Notificaciones por email**: Servicio desacoplado y preparado para integración con Brevo (SendinBlue) o cualquier proveedor SMTP.
- **Generación de PDFs**: Uso de ReportLab para reportes avanzados y personalizables.
- **Variables de entorno**: Toda configuración sensible y de entorno se gestiona por variables `.env`.

---

## 📖 Manual Básico de Usuario

### Acceso y autenticación
1. Ingresa a la URL del frontend (`http://localhost:3000`).
2. Haz clic en "Iniciar sesión" e ingresa tus credenciales.
3. Si no tienes cuenta, usa "Registrarse".

### Gestión de proyectos
1. Desde el dashboard, selecciona "Proyectos" en el menú lateral.
2. Haz clic en "Nuevo Proyecto" para crear uno.
3. Puedes editar, ver detalles o eliminar proyectos existentes.

### Gestión de tareas
1. Dentro de un proyecto, accede a la pestaña "Tareas".
2. Crea nuevas tareas, asígnalas a usuarios y cambia su estado.
3. Usa los filtros para ver tareas por estado, prioridad o responsable.

### Reportes y métricas
1. Accede a la sección "Reportes" para generar PDFs de proyectos, tareas o usuarios.
2. Visualiza métricas clave en el dashboard principal.

### Notificaciones
1. Recibe notificaciones en tiempo real sobre asignaciones, cambios y recordatorios.
2. Configura tu email para recibir notificaciones externas (si está habilitado).

### Perfil de usuario
1. Accede a tu perfil desde el menú superior derecho.
2. Actualiza tu información personal y cambia tu contraseña.

---

## 📦 Variables de Entorno

Ejemplo de archivos `.env.example` incluidos en `/backend` y `/frontend`:

### Backend (`backend/.env.example`)
```env
DATABASE_URL=postgresql://nutrabiotics_user:password123@localhost:5432/nutrabiotics_db
JWT_SECRET_KEY=tu-clave-secreta-aqui
FLASK_ENV=development
FLASK_DEBUG=True
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-app
```

### Frontend (`frontend/.env.example`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Nutrabiotics
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true
```

**Recuerda copiar estos archivos a `.env` y `.env.local` y personalizar los valores según tu entorno.**

---

## ❓ FAQ y Troubleshooting

### Preguntas Frecuentes

- **¿No puedo iniciar sesión?**
  - Verifica tus credenciales o contacta a un admin.
- **¿No veo la opción de crear usuarios?**
  - Solo los roles Admin/Manager pueden gestionar usuarios.
- **¿Cómo restablezco mi contraseña?**
  - Usa la opción “¿Olvidaste tu contraseña?” en la pantalla de login.

### Troubleshooting

- **Error de conexión a base de datos:**
  - Revisa la variable `DATABASE_URL` y que el contenedor esté corriendo.
- **Problemas con dependencias:**
  - Ejecuta `npm install` o `pip install -r requirements.txt` según corresponda.
- **Error: Puerto ya en uso:**
  - Usa `netstat -ano | findstr :3000` o `:5000` para ver qué proceso lo ocupa.
- **Error: Backend no inicia:**
  - Verifica dependencias y variables de entorno.

---

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
