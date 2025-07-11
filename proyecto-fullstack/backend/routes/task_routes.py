"""
Rutas de tareas
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.task_service import TaskService
from utils.auth_decorators import require_role

tasks_bp = Blueprint('tasks', __name__, url_prefix='/tasks')

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    """Obtener todas las tareas con filtros opcionales"""
    try:
        # Obtener filtros de query params
        project_id = request.args.get('project_id')
        assigned_to = request.args.get('assigned_to')
        status = request.args.get('status')
        priority = request.args.get('priority')
        search = request.args.get('search')
        
        filters = {}
        if project_id:
            filters['project_id'] = project_id
        if assigned_to:
            filters['assigned_to'] = assigned_to
        if status:
            filters['status'] = status
        if priority:
            filters['priority'] = priority
        if search:
            filters['search'] = search
        
        tasks, error = TaskService.get_all_tasks(filters)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'tasks': tasks
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """Obtener tarea específica"""
    try:
        task, error = TaskService.get_task_by_id(task_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('', methods=['POST'])
@require_role('admin', 'project_manager', 'team_member')
def create_task():
    """Crear nueva tarea"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('title'):
            return jsonify({'success': False, 'message': 'Título de la tarea es requerido'}), 400
        
        if not data.get('project_id'):
            return jsonify({'success': False, 'message': 'ID del proyecto es requerido'}), 400
        
        task, error = TaskService.create_task(
            title=data['title'],
            description=data.get('description', ''),
            project_id=data['project_id'],
            assigned_to=data.get('assigned_to'),
            status=data.get('status', 'pendiente'),
            priority=data.get('priority', 'media'),
            due_date=data.get('due_date'),
            created_by=current_user_id
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Tarea creada exitosamente',
            'task': task
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/<task_id>', methods=['PUT'])
@require_role('admin', 'project_manager', 'team_member')
def update_task(task_id):
    """Actualizar tarea"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        task, error = TaskService.update_task(task_id, **data)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Tarea actualizada exitosamente',
            'task': task
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@require_role('admin', 'project_manager')
def delete_task(task_id):
    """Eliminar tarea"""
    try:
        success, message = TaskService.delete_task(task_id)
        
        if not success:
            return jsonify({'success': False, 'message': message}), 404
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/<task_id>/comments', methods=['GET'])
@jwt_required()
def get_task_comments(task_id):
    """Obtener comentarios de una tarea"""
    try:
        comments, error = TaskService.get_task_comments(task_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'comments': comments
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/<task_id>/comments', methods=['POST'])
@jwt_required()
def add_task_comment(task_id):
    """Agregar comentario a una tarea"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('content'):
            return jsonify({'success': False, 'message': 'Contenido del comentario es requerido'}), 400
        
        comment, error = TaskService.add_task_comment(
            task_id=task_id,
            content=data['content'],
            user_id=current_user_id
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Comentario agregado exitosamente',
            'comment': comment
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/comments/<comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    """Actualizar comentario"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('content'):
            return jsonify({'success': False, 'message': 'Contenido del comentario es requerido'}), 400
        
        comment, error = TaskService.update_comment(
            comment_id=comment_id,
            content=data['content'],
            user_id=current_user_id
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Comentario actualizado exitosamente',
            'comment': comment
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@tasks_bp.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    """Eliminar comentario"""
    try:
        current_user_id = get_jwt_identity()
        
        success, message = TaskService.delete_comment(comment_id, current_user_id)
        
        if not success:
            return jsonify({'success': False, 'message': message}), 404
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
