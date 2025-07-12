"""
Servicios de proyectos
"""
from database import db
from models.project import Project
from models.task import Task
from models.user import User

class ProjectService:
    @staticmethod
    def get_all_projects():
        """Obtener todos los proyectos"""
        try:
            projects = Project.query.all()
            return [project.to_dict() for project in projects], None
        except Exception as e:
            return None, f"Error al obtener proyectos: {str(e)}"

    @staticmethod
    def get_project_by_id(project_id):
        """Obtener proyecto por ID"""
        project = Project.query.get(project_id)
        if not project:
            return None, "Proyecto no encontrado"
        
        return project.to_dict(include_tasks=True), None

    @staticmethod
    def create_project(name, description, created_by):
        """Crear nuevo proyecto"""
        try:
            project = Project(
                name=name,
                description=description,
                created_by=created_by
            )
            
            db.session.add(project)
            db.session.commit()
            
            return project.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al crear proyecto: {str(e)}"

    @staticmethod
    def update_project(project_id, **kwargs):
        """Actualizar proyecto"""
        project = Project.query.get(project_id)
        if not project:
            return None, "Proyecto no encontrado"
        
        try:
            for key, value in kwargs.items():
                if hasattr(project, key):
                    setattr(project, key, value)
            
            db.session.commit()
            return project.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al actualizar proyecto: {str(e)}"

    @staticmethod
    def delete_project(project_id):
        """Eliminar proyecto"""
        project = Project.query.get(project_id)
        if not project:
            return False, "Proyecto no encontrado"
        
        try:
            db.session.delete(project)
            db.session.commit()
            return True, "Proyecto eliminado exitosamente"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al eliminar proyecto: {str(e)}"

    @staticmethod
    def get_all_projects_stats():
        """Obtener estadísticas de todos los proyectos"""
        try:
            projects = Project.query.all()
            all_tasks = Task.query.all()
            
            total_projects = len(projects)
            total_tasks = len(all_tasks)
            
            # Estadísticas por estado
            tasks_by_status = {
                'todo': len([t for t in all_tasks if t.status == 'todo']),
                'in_progress': len([t for t in all_tasks if t.status == 'in_progress']),
                'review': len([t for t in all_tasks if t.status == 'review']),
                'done': len([t for t in all_tasks if t.status == 'done'])
            }
            
            # Estadísticas por prioridad
            tasks_by_priority = {
                'high': len([t for t in all_tasks if t.priority == 'high']),
                'medium': len([t for t in all_tasks if t.priority == 'medium']),
                'low': len([t for t in all_tasks if t.priority == 'low'])
            }
            
            # Proyectos por estado
            projects_by_status = {
                'active': len([p for p in projects if p.status == 'active']),
                'completed': len([p for p in projects if p.status == 'completed']),
                'on_hold': len([p for p in projects if p.status == 'on_hold'])
            }
            
            stats = {
                'total_projects': total_projects,
                'total_tasks': total_tasks,
                'tasks_by_status': tasks_by_status,
                'tasks_by_priority': tasks_by_priority,
                'projects_by_status': projects_by_status
            }
            
            return stats, None
        except Exception as e:
            return None, f"Error al obtener estadísticas: {str(e)}"

    @staticmethod
    def get_project_stats(project_id):
        """Obtener estadísticas del proyecto"""
        project = Project.query.get(project_id)
        if not project:
            return None, "Proyecto no encontrado"
        
        try:
            tasks = Task.query.filter_by(project_id=project_id).all()
            
            stats = {
                'total_tasks': len(tasks),
                'todo': len([t for t in tasks if t.status == 'todo']),
                'in_progress': len([t for t in tasks if t.status == 'in_progress']),
                'review': len([t for t in tasks if t.status == 'review']),
                'done': len([t for t in tasks if t.status == 'done']),
                'high_priority': len([t for t in tasks if t.priority == 'high']),
                'medium_priority': len([t for t in tasks if t.priority == 'medium']),
                'low_priority': len([t for t in tasks if t.priority == 'low'])
            }
            
            return stats, None
        except Exception as e:
            return None, f"Error al obtener estadísticas: {str(e)}"
