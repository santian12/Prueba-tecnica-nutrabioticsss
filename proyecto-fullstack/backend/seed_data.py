from app import app, db, User, Project, Task
from datetime import datetime, date
import uuid

def create_sample_data():
    """Crea datos de ejemplo para la aplicación"""
    
    with app.app_context():
        # Limpiar datos existentes
        db.drop_all()
        db.create_all()
        
        # Crear usuarios
        admin = User(
            id=str(uuid.uuid4()),
            name='Admin Principal',
            email='admin@nutrabiotics.com',
            role='admin'
        )
        admin.set_password('admin123')
        
        manager1 = User(
            id=str(uuid.uuid4()),
            name='María González',
            email='maria@nutrabiotics.com',
            role='manager'
        )
        manager1.set_password('manager123')
        
        dev1 = User(
            id=str(uuid.uuid4()),
            name='Juan Pérez',
            email='juan@nutrabiotics.com',
            role='developer'
        )
        dev1.set_password('dev123')
        
        dev2 = User(
            id=str(uuid.uuid4()),
            name='Ana Rodríguez',
            email='ana@nutrabiotics.com',
            role='developer'
        )
        dev2.set_password('dev123')
        
        dev3 = User(
            id=str(uuid.uuid4()),
            name='Carlos López',
            email='carlos@nutrabiotics.com',
            role='developer'
        )
        dev3.set_password('dev123')
        
        # Agregar usuarios a la base de datos
        db.session.add_all([admin, manager1, dev1, dev2, dev3])
        db.session.commit()
        
        # Crear proyectos
        proyecto1 = Project(
            id=str(uuid.uuid4()),
            name='Sistema de Gestión de Inventario',
            description='Desarrollo de un sistema completo para gestionar el inventario de productos nutracéuticos',
            status='in_progress',
            priority='high',
            start_date=date(2024, 1, 15),
            end_date=date(2024, 6, 30),
            manager_id=manager1.id
        )
        proyecto1.developers.extend([dev1, dev2])
        
        proyecto2 = Project(
            id=str(uuid.uuid4()),
            name='App Móvil de Seguimiento',
            description='Aplicación móvil para que los usuarios puedan seguir su progreso nutricional',
            status='planning',
            priority='medium',
            start_date=date(2024, 3, 1),
            end_date=date(2024, 9, 15),
            manager_id=manager1.id
        )
        proyecto2.developers.extend([dev2, dev3])
        
        proyecto3 = Project(
            id=str(uuid.uuid4()),
            name='Portal de Clientes',
            description='Portal web para que los clientes puedan realizar pedidos y consultar su historial',
            status='completed',
            priority='low',
            start_date=date(2023, 10, 1),
            end_date=date(2023, 12, 31),
            manager_id=manager1.id
        )
        proyecto3.developers.extend([dev1, dev3])
        
        # Agregar proyectos a la base de datos
        db.session.add_all([proyecto1, proyecto2, proyecto3])
        db.session.commit()
        
        # Crear tareas para el proyecto 1
        task1 = Task(
            id=str(uuid.uuid4()),
            title='Diseño de base de datos',
            description='Crear el esquema de base de datos para el sistema de inventario',
            status='done',
            priority='high',
            project_id=proyecto1.id,
            assigned_to=dev1.id,
            estimated_hours=16,
            actual_hours=14,
            due_date=date(2024, 2, 15)
        )
        
        task2 = Task(
            id=str(uuid.uuid4()),
            title='Desarrollo del API REST',
            description='Implementar los endpoints para gestión de productos',
            status='in_progress',
            priority='high',
            project_id=proyecto1.id,
            assigned_to=dev1.id,
            estimated_hours=40,
            actual_hours=25,
            due_date=date(2024, 3, 30)
        )
        
        task3 = Task(
            id=str(uuid.uuid4()),
            title='Frontend - Lista de productos',
            description='Crear la interfaz para mostrar y filtrar productos',
            status='review',
            priority='medium',
            project_id=proyecto1.id,
            assigned_to=dev2.id,
            estimated_hours=24,
            actual_hours=28,
            due_date=date(2024, 4, 15)
        )
        
        # Crear tareas para el proyecto 2
        task4 = Task(
            id=str(uuid.uuid4()),
            title='Prototipo de wireframes',
            description='Crear los wireframes para la aplicación móvil',
            status='todo',
            priority='medium',
            project_id=proyecto2.id,
            assigned_to=dev2.id,
            estimated_hours=12,
            due_date=date(2024, 3, 15)
        )
        
        task5 = Task(
            id=str(uuid.uuid4()),
            title='Configuración del proyecto React Native',
            description='Configurar el entorno de desarrollo para React Native',
            status='todo',
            priority='low',
            project_id=proyecto2.id,
            assigned_to=dev3.id,
            estimated_hours=8,
            due_date=date(2024, 3, 20)
        )
        
        # Crear tareas para el proyecto 3 (completado)
        task6 = Task(
            id=str(uuid.uuid4()),
            title='Implementación de autenticación',
            description='Sistema de login y registro de usuarios',
            status='done',
            priority='high',
            project_id=proyecto3.id,
            assigned_to=dev1.id,
            estimated_hours=20,
            actual_hours=18,
            due_date=date(2023, 11, 15)
        )
        
        task7 = Task(
            id=str(uuid.uuid4()),
            title='Carrito de compras',
            description='Funcionalidad para agregar productos al carrito',
            status='done',
            priority='medium',
            project_id=proyecto3.id,
            assigned_to=dev3.id,
            estimated_hours=16,
            actual_hours=20,
            due_date=date(2023, 12, 1)
        )
        
        # Agregar tareas a la base de datos
        db.session.add_all([task1, task2, task3, task4, task5, task6, task7])
        db.session.commit()
        
        print("✅ Datos de ejemplo creados exitosamente!")
        print("\n📋 Usuarios creados:")
        print(f"  Admin: admin@nutrabiotics.com (password: admin123)")
        print(f"  Manager: maria@nutrabiotics.com (password: manager123)")
        print(f"  Developer 1: juan@nutrabiotics.com (password: dev123)")
        print(f"  Developer 2: ana@nutrabiotics.com (password: dev123)")
        print(f"  Developer 3: carlos@nutrabiotics.com (password: dev123)")
        print("\n🚀 Proyectos creados: 3")
        print("📝 Tareas creadas: 7")

if __name__ == '__main__':
    create_sample_data()
