from app import app, db, User, Project, Task, Notification
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
            role='project_manager'
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
            name='Sistema de Gestión de Inventario',
            description='Desarrollo de un sistema completo para gestionar el inventario de productos nutracéuticos',
            status='active',
            created_by=manager1.id
        )
        
        proyecto2 = Project(
            name='App Móvil de Seguimiento',
            description='Aplicación móvil para que los usuarios puedan seguir su progreso nutricional',
            status='planning',
            created_by=manager1.id
        )
        
        proyecto3 = Project(
            name='Portal de Clientes',
            description='Portal web para que los clientes puedan realizar pedidos y consultar su historial',
            status='completed',
            created_by=manager1.id
        )
        
        # Agregar proyectos a la base de datos
        db.session.add_all([proyecto1, proyecto2, proyecto3])
        db.session.commit()
        
        # Crear tareas para el proyecto 1
        task1 = Task(
            title='Diseño de base de datos',
            description='Crear el esquema de base de datos para el sistema de inventario',
            status='done',
            priority='high',
            project_id=proyecto1.id,
            assigned_to=dev1.id,
            due_date=date(2024, 2, 15)
        )
        
        task2 = Task(
            title='Desarrollo del API REST',
            description='Implementar los endpoints para gestión de productos',
            status='in_progress',
            priority='high',
            project_id=proyecto1.id,
            assigned_to=dev1.id,
            due_date=date(2024, 3, 30)
        )
        
        task3 = Task(
            title='Frontend - Lista de productos',
            description='Crear la interfaz para mostrar y filtrar productos',
            status='review',
            priority='medium',
            project_id=proyecto1.id,
            assigned_to=dev2.id,
            due_date=date(2024, 4, 15)
        )
        
        # Crear tareas para el proyecto 2
        task4 = Task(
            title='Prototipo de wireframes',
            description='Crear los wireframes para la aplicación móvil',
            status='todo',
            priority='medium',
            project_id=proyecto2.id,
            assigned_to=dev2.id,
            due_date=date(2024, 3, 15)
        )
        
        task5 = Task(
            title='Configuración del proyecto React Native',
            description='Configurar el entorno de desarrollo para React Native',
            status='todo',
            priority='low',
            project_id=proyecto2.id,
            assigned_to=dev3.id,
            due_date=date(2024, 3, 20)
        )
        
        # Crear tareas para el proyecto 3 (completado)
        task6 = Task(
            title='Implementación de autenticación',
            description='Sistema de login y registro de usuarios',
            status='done',
            priority='high',
            project_id=proyecto3.id,
            assigned_to=dev1.id,
            due_date=date(2023, 11, 15)
        )
        
        task7 = Task(
            title='Carrito de compras',
            description='Funcionalidad para agregar productos al carrito',
            status='done',
            priority='medium',
            project_id=proyecto3.id,
            assigned_to=dev3.id,
            due_date=date(2023, 12, 1)
        )
        
        # Agregar tareas a la base de datos
        db.session.add_all([task1, task2, task3, task4, task5, task6, task7])
        db.session.commit()
        
        # Crear notificaciones de ejemplo
        notification1 = Notification(
            user_id=dev1.id,
            title='Nueva tarea asignada',
            message='Se te ha asignado: Desarrollo del API REST',
            type='info',
            category='task',
            unread=True
        )
        
        notification2 = Notification(
            user_id=dev1.id,
            title='Tarea completada',
            message='Has completado: Diseño de base de datos',
            type='success',
            category='task',
            unread=False
        )
        
        notification3 = Notification(
            user_id=dev2.id,
            title='Proyecto actualizado',
            message='Se ha actualizado el proyecto: Sistema de Gestión de Inventario',
            type='info',
            category='project',
            unread=True
        )
        
        notification4 = Notification(
            user_id=dev2.id,
            title='Reunión programada',
            message='Reunión programada para mañana a las 10:00 AM',
            type='warning',
            category='meeting',
            unread=True
        )
        
        notification5 = Notification(
            user_id=dev3.id,
            title='Bienvenido al sistema',
            message='Bienvenido a la plataforma Nutrabiotics',
            type='info',
            category='system',
            unread=False
        )
        
        notification6 = Notification(
            user_id=manager1.id,
            title='Error crítico',
            message='Error en el servidor de producción',
            type='error',
            category='system',
            unread=True
        )
        
        # Agregar notificaciones a la base de datos
        db.session.add_all([notification1, notification2, notification3, notification4, notification5, notification6])
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
        print("🔔 Notificaciones creadas: 6")

if __name__ == '__main__':
    create_sample_data()
