"""
Servicios de tareas
"""
from datetime import datetime
from database import db
from models.task import Task
from models.project import Project
from models.user import User

class TaskService:
    @staticmethod
    def get_all_tasks(filters=None):
        """Obtener todas las tareas con filtros opcionales"""
        try:
            query = Task.query
            
            if filters:
                if 'project_id' in filters:
                    query = query.filter_by(project_id=filters['project_id'])
                if 'assigned_to' in filters:
                    query = query.filter_by(assigned_to=filters['assigned_to'])
                if 'status' in filters:
                    query = query.filter_by(status=filters['status'])
                if 'priority' in filters:
                    query = query.filter_by(priority=filters['priority'])
                if 'search' in filters:
                    search_term = f"%{filters['search']}%"
                    query = query.filter(Task.title.ilike(search_term) | Task.description.ilike(search_term))
            
            tasks = query.all()
            return [task.to_dict() for task in tasks], None
        except Exception as e:
            return None, f"Error al obtener tareas: {str(e)}"

    @staticmethod
    def get_all_tasks_stats():
        """Obtener estadísticas de todas las tareas"""
        try:
            tasks = Task.query.all()
            
            total_tasks = len(tasks)
            
            # Estadísticas por estado
            tasks_by_status = {
                'todo': len([t for t in tasks if t.status == 'todo']),
                'in_progress': len([t for t in tasks if t.status == 'in_progress']),
                'review': len([t for t in tasks if t.status == 'review']),
                'done': len([t for t in tasks if t.status == 'done'])
            }
            
            # Estadísticas por prioridad
            tasks_by_priority = {
                'high': len([t for t in tasks if t.priority == 'high']),
                'medium': len([t for t in tasks if t.priority == 'medium']),
                'low': len([t for t in tasks if t.priority == 'low'])
            }
            
            # Estadísticas adicionales para compatibility
            stats = {
                'total_tasks': total_tasks,
                'completed_tasks': tasks_by_status['done'],
                'in_progress_tasks': tasks_by_status['in_progress'],
                'pending_tasks': tasks_by_status['todo'],
                'tasks_by_status': tasks_by_status,
                'tasks_by_priority': tasks_by_priority
            }
            
            return stats, None
        except Exception as e:
            return None, f"Error al obtener estadísticas: {str(e)}"

    @staticmethod
    def get_tasks_by_project(project_id):
        """Obtener tareas por proyecto"""
        try:
            tasks = Task.query.filter_by(project_id=project_id).all()
            return [task.to_dict() for task in tasks], None
        except Exception as e:
            return None, f"Error al obtener tareas: {str(e)}"

    @staticmethod
    def get_task_by_id(task_id):
        """Obtener tarea por ID"""
        task = Task.query.get(task_id)
        if not task:
            return None, "Tarea no encontrada"
        
        return task.to_dict(include_comments=True), None

    @staticmethod
    def create_task(title, description, project_id, assigned_to=None, priority='medium', status='todo', due_date=None):
        """Crear nueva tarea"""
        # Verificar que el proyecto existe
        project = Project.query.get(project_id)
        if not project:
            return None, "Proyecto no encontrado"
        
        # Verificar que el usuario asignado existe (si se proporciona)
        if assigned_to:
            user = User.query.get(assigned_to)
            if not user:
                return None, "Usuario asignado no encontrado"
        
        try:
            task = Task(
                title=title,
                description=description,
                project_id=project_id,
                assigned_to=assigned_to,
                priority=priority,
                status=status,
                due_date=datetime.strptime(due_date, '%Y-%m-%d').date() if due_date else None
            )
            
            db.session.add(task)
            db.session.commit()
            
            return task.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al crear tarea: {str(e)}"

    @staticmethod
    def update_task(task_id, **kwargs):
        """Actualizar tarea"""
        print(f"🔧 UPDATE_TASK - ID: {task_id}")
        print(f"🔧 UPDATE_TASK - Datos recibidos: {kwargs}")
        
        task = Task.query.get(task_id)
        if not task:
            return None, "Tarea no encontrada"
        
        # Validar que el status sea un valor válido del enum, no un UUID
        if 'status' in kwargs:
            valid_statuses = ['todo', 'in_progress', 'review', 'done']
            print(f"🔧 Validando status: '{kwargs['status']}'")
            if kwargs['status'] not in valid_statuses:
                return None, f"Estado inválido '{kwargs['status']}'. Debe ser uno de: {', '.join(valid_statuses)}"
        
        # Validar priority también
        if 'priority' in kwargs:
            valid_priorities = ['low', 'medium', 'high', 'critical']
            print(f"🔧 Validando priority: '{kwargs['priority']}'")
            if kwargs['priority'] not in valid_priorities:
                return None, f"Prioridad inválida '{kwargs['priority']}'. Debe ser una de: {', '.join(valid_priorities)}"
        
        try:
            # Manejar fecha especial
            if 'due_date' in kwargs and kwargs['due_date']:
                print(f"🔧 Procesando fecha: {kwargs['due_date']}")
                kwargs['due_date'] = datetime.strptime(kwargs['due_date'], '%Y-%m-%d').date()
            
            print(f"🔧 Actualizando campos...")
            for key, value in kwargs.items():
                if hasattr(task, key):
                    print(f"🔧   {key}: {value}")
                    setattr(task, key, value)
                else:
                    print(f"⚠️  Campo ignorado (no existe): {key}")
            
            print(f"🔧 Commitando cambios...")
            db.session.commit()
            print(f"✅ Tarea actualizada exitosamente")
            return task.to_dict(), None
        except Exception as e:
            print(f"❌ Error al actualizar tarea: {str(e)}")
            print(f"❌ Tipo de error: {type(e).__name__}")
            db.session.rollback()
            return None, f"Error al actualizar tarea: {str(e)}"

    @staticmethod
    def update_task_status(task_id, new_status):
        """Actualizar solo el estado de la tarea"""
        task = Task.query.get(task_id)
        if not task:
            return None, "Tarea no encontrada"
        
        try:
            task.status = new_status
            db.session.commit()
            return task.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al actualizar estado: {str(e)}"

    @staticmethod
    def delete_task(task_id):
        """Eliminar tarea"""
        task = Task.query.get(task_id)
        if not task:
            return False, "Tarea no encontrada"
        
        try:
            db.session.delete(task)
            db.session.commit()
            return True, "Tarea eliminada exitosamente"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al eliminar tarea: {str(e)}"

    @staticmethod
    def get_user_tasks(user_id):
        """Obtener tareas asignadas a un usuario"""
        try:
            tasks = Task.query.filter_by(assigned_to=user_id).all()
            return [task.to_dict() for task in tasks], None
        except Exception as e:
            return None, f"Error al obtener tareas del usuario: {str(e)}"

    @staticmethod
    def get_tasks_by_status(status):
        """Obtener tareas por estado"""
        try:
            tasks = Task.query.filter_by(status=status).all()
            return [task.to_dict() for task in tasks], None
        except Exception as e:
            return None, f"Error al obtener tareas por estado: {str(e)}"
