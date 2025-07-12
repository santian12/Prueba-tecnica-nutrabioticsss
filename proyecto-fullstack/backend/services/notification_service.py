"""
Servicio de Notificaciones
Maneja la lógica de negocio para notificaciones de usuarios
"""
from database import db
from models.notification import Notification
from models.user import User
import uuid


class NotificationService:
    """Servicio para gestionar notificaciones"""

    @staticmethod
    def get_user_notifications(user_id, limit=20, offset=0, unread_only=False):
        """
        Obtener notificaciones de un usuario
        """
        try:
            query = Notification.query.filter_by(user_id=user_id)
            
            if unread_only:
                query = query.filter_by(unread=True)
            
            notifications = query.order_by(Notification.created_at.desc())\
                                .limit(limit)\
                                .offset(offset)\
                                .all()
            
            return [notification.to_dict() for notification in notifications]
        except Exception as e:
            print(f"Error al obtener notificaciones: {e}")
            return []

    @staticmethod
    def get_unread_count(user_id):
        """
        Obtener número de notificaciones no leídas
        """
        try:
            count = Notification.query.filter_by(user_id=user_id, unread=True).count()
            return count
        except Exception as e:
            print(f"Error al contar notificaciones no leídas: {e}")
            return 0

    @staticmethod
    def mark_as_read(notification_id, user_id):
        """
        Marcar una notificación como leída
        """
        try:
            notification = Notification.query.filter_by(
                id=notification_id, 
                user_id=user_id
            ).first()
            
            if not notification:
                return False, "Notificación no encontrada"
            
            notification.unread = False
            db.session.commit()
            
            return True, "Notificación marcada como leída"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al marcar notificación como leída: {e}"

    @staticmethod
    def mark_all_as_read(user_id):
        """
        Marcar todas las notificaciones como leídas
        """
        try:
            Notification.query.filter_by(user_id=user_id, unread=True)\
                            .update({Notification.unread: False})
            db.session.commit()
            
            return True, "Todas las notificaciones marcadas como leídas"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al marcar todas las notificaciones como leídas: {e}"

    @staticmethod
    def delete_notification(notification_id, user_id):
        """
        Eliminar una notificación
        """
        try:
            notification = Notification.query.filter_by(
                id=notification_id, 
                user_id=user_id
            ).first()
            
            if not notification:
                return False, "Notificación no encontrada"
            
            db.session.delete(notification)
            db.session.commit()
            
            return True, "Notificación eliminada"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al eliminar notificación: {e}"

    @staticmethod
    def create_notification(user_id, title, message, notification_type='info', category='system'):
        """
        Crear una nueva notificación
        """
        try:
            notification = Notification(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
                message=message,
                type=notification_type,
                category=category
            )
            
            db.session.add(notification)
            db.session.commit()
            
            return True, notification.to_dict()
        except Exception as e:
            db.session.rollback()
            return False, f"Error al crear notificación: {e}"

    @staticmethod
    def create_task_notification(user_id, task_title, action='assigned'):
        """
        Crear notificación específica para tareas
        """
        title_map = {
            'assigned': f'Nueva tarea asignada',
            'completed': f'Tarea completada',
            'updated': f'Tarea actualizada'
        }
        
        message_map = {
            'assigned': f'Se te ha asignado: {task_title}',
            'completed': f'Has completado: {task_title}',
            'updated': f'Se ha actualizado: {task_title}'
        }
        
        title = title_map.get(action, 'Notificación de tarea')
        message = message_map.get(action, f'Acción en tarea: {task_title}')
        
        return NotificationService.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type='info',
            category='task'
        )

    @staticmethod
    def create_project_notification(user_id, project_title, action='created'):
        """
        Crear notificación específica para proyectos
        """
        title_map = {
            'created': f'Nuevo proyecto creado',
            'updated': f'Proyecto actualizado',
            'completed': f'Proyecto completado'
        }
        
        message_map = {
            'created': f'Se ha creado el proyecto: {project_title}',
            'updated': f'Se ha actualizado el proyecto: {project_title}',
            'completed': f'Se ha completado el proyecto: {project_title}'
        }
        
        title = title_map.get(action, 'Notificación de proyecto')
        message = message_map.get(action, f'Acción en proyecto: {project_title}')
        
        return NotificationService.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type='success',
            category='project'
        )

    @staticmethod
    def create_system_notification(user_id, title, message, notification_type='info'):
        """
        Crear notificación del sistema
        """
        return NotificationService.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            category='system'
        )
