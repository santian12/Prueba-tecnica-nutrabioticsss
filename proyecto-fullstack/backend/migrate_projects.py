#!/usr/bin/env python3
"""
Script para migrar la tabla projects agregando las columnas priority y end_date
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import db
from sqlalchemy import text

def migrate_projects_table():
    """Migrar tabla projects"""
    app = create_app()
    
    with app.app_context():
        try:
            # Crear el tipo enum si no existe
            try:
                with db.engine.connect() as connection:
                    connection.execute(text("CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high')"))
                    connection.commit()
                print("✅ Tipo project_priority creado")
            except Exception:
                print("✅ Tipo project_priority ya existe")
            
            # Verificar si las columnas ya existen
            with db.engine.connect() as connection:
                result = connection.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'projects' AND column_name IN ('priority', 'end_date')"
                ))
                existing_columns = [row[0] for row in result.fetchall()]
                
                if 'priority' not in existing_columns:
                    print("Agregando columna priority...")
                    connection.execute(text(
                        "ALTER TABLE projects ADD COLUMN priority project_priority DEFAULT 'medium' NOT NULL"
                    ))
                    connection.commit()
                    print("✅ Columna priority agregada")
                else:
                    print("✅ Columna priority ya existe")
                    
                if 'end_date' not in existing_columns:
                    print("Agregando columna end_date...")
                    connection.execute(text(
                        "ALTER TABLE projects ADD COLUMN end_date DATE"
                    ))
                    connection.commit()
                    print("✅ Columna end_date agregada")
                else:
                    print("✅ Columna end_date ya existe")
                
            print("🎉 Migración completada exitosamente")
            
        except Exception as e:
            print(f"❌ Error durante la migración: {str(e)}")
            sys.exit(1)

if __name__ == '__main__':
    migrate_projects_table()
