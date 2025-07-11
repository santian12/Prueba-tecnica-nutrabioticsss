"""
Rutas de métricas y estadísticas
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.project_service import ProjectService
from services.task_service import TaskService

metrics_bp = Blueprint('metrics', __name__, url_prefix='/metrics')

@metrics_bp.route('/general', methods=['GET'])
@jwt_required()
def get_general_metrics():
    """Obtener métricas generales del sistema"""
    try:
        # Obtener todas las estadísticas
        project_metrics, p_error = ProjectService.get_all_projects_stats()
        task_metrics, t_error = TaskService.get_all_tasks_stats()
        
        if p_error or t_error:
            return jsonify({
                'success': False, 
                'message': f'Error obteniendo métricas: {p_error or t_error}'
            }), 500
        
        # Combinar métricas
        general_metrics = {
            'projects': project_metrics,
            'tasks': task_metrics,
            'summary': {
                'total_projects': project_metrics.get('total_projects', 0),
                'total_tasks': task_metrics.get('total_tasks', 0),
                'completed_tasks': task_metrics.get('completed_tasks', 0),
                'in_progress_tasks': task_metrics.get('in_progress_tasks', 0),
                'pending_tasks': task_metrics.get('pending_tasks', 0)
            }
        }
        
        return jsonify({
            'success': True,
            'metrics': general_metrics
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects_metrics():
    """Obtener métricas específicas de proyectos"""
    try:
        metrics, error = ProjectService.get_all_projects_stats()
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project_metrics(project_id):
    """Obtener métricas de un proyecto específico"""
    try:
        metrics, error = ProjectService.get_project_stats(project_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks_metrics():
    """Obtener métricas específicas de tareas"""
    try:
        # Obtener filtros opcionales
        project_id = request.args.get('project_id')
        assigned_to = request.args.get('assigned_to')
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if assigned_to:
            filters['assigned_to'] = assigned_to
        
        metrics, error = TaskService.get_tasks_stats(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/charts/tasks-by-status', methods=['GET'])
@jwt_required()
def get_tasks_by_status_chart():
    """Obtener datos para gráfico de tareas por estado"""
    try:
        project_id = request.args.get('project_id')
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        
        chart_data, error = TaskService.get_tasks_by_status_chart(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'chart_data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/charts/tasks-by-priority', methods=['GET'])
@jwt_required()
def get_tasks_by_priority_chart():
    """Obtener datos para gráfico de tareas por prioridad"""
    try:
        project_id = request.args.get('project_id')
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        
        chart_data, error = TaskService.get_tasks_by_priority_chart(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'chart_data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/charts/projects-progress', methods=['GET'])
@jwt_required()
def get_projects_progress_chart():
    """Obtener datos para gráfico de progreso de proyectos"""
    try:
        chart_data, error = ProjectService.get_projects_progress_chart()
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'chart_data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@metrics_bp.route('/charts/tasks-timeline', methods=['GET'])
@jwt_required()
def get_tasks_timeline_chart():
    """Obtener datos para gráfico de línea temporal de tareas"""
    try:
        project_id = request.args.get('project_id')
        days = request.args.get('days', 30)  # Por defecto últimos 30 días
        
        try:
            days = int(days)
        except ValueError:
            days = 30
        
        filters = {'days': days}
        if project_id:
            filters['project_id'] = project_id
        
        chart_data, error = TaskService.get_tasks_timeline_chart(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'chart_data': chart_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
