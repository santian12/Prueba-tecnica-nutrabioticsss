#!/usr/bin/env python3
"""
Script temporal para verificar configuración de base de datos
"""
import os
import sys

# Obtener variables de entorno
flask_env = os.getenv('FLASK_ENV', 'No configurado')
database_url = os.getenv('DATABASE_URL', 'No configurado')

print("=== DIAGNÓSTICO DE CONFIGURACIÓN ===")
print(f"FLASK_ENV: {flask_env}")
print(f"DATABASE_URL: {database_url}")

# Cargar configuración de Flask
sys.path.append('/app')
from config import get_config

config = get_config()
print(f"Config class: {config.__name__}")
print(f"SQLALCHEMY_DATABASE_URI: {config.SQLALCHEMY_DATABASE_URI}")

# Verificar conexión a base de datos
try:
    from database import db
    from app import create_app
    
    app = create_app()
    with app.app_context():
        # Test de conexión
        with db.engine.connect() as conn:
            if 'postgresql' in config.SQLALCHEMY_DATABASE_URI:
                result = conn.execute(db.text("SELECT version();"))
                version = result.fetchone()[0]
                print(f"✅ PostgreSQL conectado: {version[:50]}...")
                
                # Contar datos
                users = conn.execute(db.text("SELECT COUNT(*) FROM users;")).fetchone()[0]
                projects = conn.execute(db.text("SELECT COUNT(*) FROM projects;")).fetchone()[0]
                tasks = conn.execute(db.text("SELECT COUNT(*) FROM tasks;")).fetchone()[0]
                
                print(f"📊 Datos: {users} usuarios, {projects} proyectos, {tasks} tareas")
            else:
                result = conn.execute(db.text("SELECT sqlite_version();"))
                version = result.fetchone()[0]
                print(f"✅ SQLite conectado: {version}")
                
except Exception as e:
    print(f"❌ Error de conexión: {e}")
