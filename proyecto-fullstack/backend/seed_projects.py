#!/usr/bin/env python3
"""
Script para insertar proyectos de prueba en la base de datos
"""
import sys
import os
sys.path.append('/app')

from app import app, db, User, Project, Task
from datetime import datetime
import uuid

def seed_projects():
    """Insertar proyectos de prueba"""
    with app.app_context():
        try:
            # Buscar un usuario admin
            admin_user = User.query.filter_by(role='admin').first()
            if not admin_user:
                print("❌ No se encontró usuario admin")
                return
            
            print(f"✅ Usuario admin encontrado: {admin_user.name}")
            
            # Crear proyectos de prueba
            projects_data = [
                {
                    'name': 'Proyecto de Prueba 1',
                    'description': 'Este es un proyecto de prueba para verificar la funcionalidad',
                    'status': 'active',
                    'priority': 'high',
                    'created_by': admin_user.id
                },
                {
                    'name': 'Sistema de Inventario',
                    'description': 'Desarrollo del sistema de gestión de inventario',
                    'status': 'active',
                    'priority': 'medium',
                    'created_by': admin_user.id
                },
                {
                    'name': 'App Móvil Nutrabiotics',
                    'description': 'Aplicación móvil para gestión de productos',
                    'status': 'planning',
                    'priority': 'high',
                    'created_by': admin_user.id
                }
            ]
            
            # Verificar si ya existen proyectos
            existing_projects = Project.query.count()
            print(f"📊 Proyectos existentes: {existing_projects}")
            
            # Crear proyectos
            for project_data in projects_data:
                # Verificar si el proyecto ya existe
                existing = Project.query.filter_by(name=project_data['name']).first()
                if existing:
                    print(f"⚠️  Proyecto '{project_data['name']}' ya existe")
                    continue
                
                project = Project(
                    id=str(uuid.uuid4()),
                    name=project_data['name'],
                    description=project_data['description'],
                    status=project_data['status'],
                    priority=project_data['priority'],
                    created_by=project_data['created_by']
                )
                
                db.session.add(project)
                print(f"✅ Proyecto creado: {project.name}")
            
            db.session.commit()
            
            # Verificar resultado
            total_projects = Project.query.count()
            print(f"📊 Total de proyectos ahora: {total_projects}")
            
            # Listar todos los proyectos
            all_projects = Project.query.all()
            print("\n📋 Proyectos en la base de datos:")
            for project in all_projects:
                print(f"  - {project.name} (ID: {project.id})")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error: {str(e)}")

if __name__ == '__main__':
    seed_projects()
