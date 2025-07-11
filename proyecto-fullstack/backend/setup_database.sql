-- Script para configurar PostgreSQL
-- Ejecutar este script en PostgreSQL como superusuario

-- Crear base de datos
CREATE DATABASE nutrabiotics_db;

-- Crear usuario
CREATE USER nutrabiotics_user WITH PASSWORD 'password123';

-- Conceder permisos
GRANT ALL PRIVILEGES ON DATABASE nutrabiotics_db TO nutrabiotics_user;

-- Conectar a la base de datos
\c nutrabiotics_db;

-- Conceder permisos adicionales
GRANT ALL ON SCHEMA public TO nutrabiotics_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nutrabiotics_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nutrabiotics_user;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO nutrabiotics_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO nutrabiotics_user;
