"""
Rutas de proyectos
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.project_service import ProjectService
from services.task_service import TaskService
from utils.auth_decorators import require_role

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """Obtener todos los proyectos"""
    try:
        projects, error = ProjectService.get_all_projects()
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'projects': projects
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Obtener proyecto específico"""
    try:
        project, error = ProjectService.get_project_by_id(project_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'project': project
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects', methods=['POST'])
@require_role('admin', 'project_manager')
def create_project():
    """Crear nuevo proyecto"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('name'):
            return jsonify({'success': False, 'message': 'Nombre del proyecto es requerido'}), 400
        
        # Extraer campos requeridos
        name = data['name']
        description = data.get('description', '')
        
        # Extraer campos opcionales
        optional_fields = {}
        for field in ['status', 'priority', 'end_date']:
            if field in data and data[field] is not None:
                optional_fields[field] = data[field]
        
        project, error = ProjectService.create_project(
            name=name,
            description=description,
            created_by=current_user_id,
            **optional_fields
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Proyecto creado exitosamente',
            'project': project
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>', methods=['PUT'])
@require_role('admin', 'project_manager')
def update_project(project_id):
    """Actualizar proyecto"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        project, error = ProjectService.update_project(project_id, **data)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Proyecto actualizado exitosamente',
            'project': project
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>', methods=['DELETE'])
@require_role('admin', 'project_manager')
def delete_project(project_id):
    """Eliminar proyecto"""
    try:
        success, message = ProjectService.delete_project(project_id)
        
        if not success:
            return jsonify({'success': False, 'message': message}), 404
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>/stats', methods=['GET'])
@jwt_required()
def get_project_stats(project_id):
    """Obtener estadísticas del proyecto"""
    try:
        stats, error = ProjectService.get_project_stats(project_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>/tasks', methods=['GET'])
@jwt_required()
def get_project_tasks(project_id):
    """Obtener todas las tareas de un proyecto"""
    try:
        tasks, error = TaskService.get_tasks_by_project(project_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'tasks': tasks
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@projects_bp.route('/projects/<project_id>/tasks', methods=['POST'])
@jwt_required()
def create_project_task(project_id):
    """Crear nueva tarea en un proyecto"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('title'):
            return jsonify({'success': False, 'message': 'Título de la tarea es requerido'}), 400
        
        # Agregar el project_id a los datos
        data['project_id'] = project_id
        data['created_by'] = current_user_id
        
        task, error = TaskService.create_task(**data)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Tarea creada exitosamente',
            'task': task
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
