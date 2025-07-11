"""
Rutas de proyectos
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.project_service import ProjectService
from utils.auth_decorators import require_role

projects_bp = Blueprint('projects', __name__, url_prefix='/projects')

@projects_bp.route('', methods=['GET'])
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

@projects_bp.route('/<project_id>', methods=['GET'])
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

@projects_bp.route('', methods=['POST'])
@require_role('admin', 'project_manager')
def create_project():
    """Crear nuevo proyecto"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('name'):
            return jsonify({'success': False, 'message': 'Nombre del proyecto es requerido'}), 400
        
        project, error = ProjectService.create_project(
            name=data['name'],
            description=data.get('description', ''),
            created_by=current_user_id
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

@projects_bp.route('/<project_id>', methods=['PUT'])
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

@projects_bp.route('/<project_id>', methods=['DELETE'])
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

@projects_bp.route('/<project_id>/stats', methods=['GET'])
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
