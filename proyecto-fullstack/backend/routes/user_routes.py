"""
Rutas de usuarios
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.auth_service import AuthService
from utils.auth_decorators import require_role

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    """Obtener todos los usuarios"""
    try:
        # Verificar rol del usuario actual
        current_user_id = get_jwt_identity()
        print(f"[DEBUG] Current user ID: {current_user_id}")
        
        current_user, error = AuthService.get_user_by_id(current_user_id)
        print(f"[DEBUG] Current user: {current_user}, Error: {error}")
        
        if error:
            print(f"[DEBUG] Error getting current user: {error}")
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
        
        # Solo admin puede ver todos los usuarios
        if current_user.get('role') != 'admin':
            print(f"[DEBUG] User role '{current_user.get('role')}' is not admin")
            return jsonify({'success': False, 'message': 'Acceso denegado. Se requiere rol de administrador'}), 403
        
        users, error = AuthService.get_all_users()
        print(f"[DEBUG] Users retrieved: {len(users) if users else 0}, Error: {error}")
        if error:
            return jsonify({'success': False, 'message': error}), 500
        # Filtrar usuarios con id válido
        filtered_users = [u for u in users if u and isinstance(u, dict) and 'id' in u and isinstance(u['id'], str) and u['id'].strip() != '']
        return jsonify({
            'success': True,
            'data': filtered_users,
            'total': len(filtered_users)
        }), 200
        
    except Exception as e:
        print(f"[DEBUG] Exception in get_all_users: {str(e)}")
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Obtener perfil del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        user, error = AuthService.get_user_by_id(current_user_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Actualizar perfil del usuario actual"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        user, error = AuthService.update_user_profile(current_user_id, **data)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Perfil actualizado exitosamente',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/<user_id>', methods=['GET'])
@require_role('admin', 'project_manager')
def get_user(user_id):
    """Obtener usuario específico"""
    try:
        user, error = AuthService.get_user_by_id(user_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 404
        
        return jsonify({
            'success': True,
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/<user_id>', methods=['PUT'])
@require_role('admin')
def update_user(user_id):
    """Actualizar usuario (solo admin)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'Datos requeridos'}), 400
        
        user, error = AuthService.update_user_profile(user_id, **data)
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Usuario actualizado exitosamente',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/<user_id>', methods=['DELETE'])
@require_role('admin')
def delete_user(user_id):
    """Eliminar usuario (solo admin)"""
    try:
        success, message = AuthService.delete_user(user_id)
        
        if not success:
            return jsonify({'success': False, 'message': message}), 404
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/<user_id>/role', methods=['PUT'])
@require_role('admin')
def update_user_role(user_id):
    """Actualizar rol de usuario (solo admin)"""
    try:
        data = request.get_json()
        
        if not data or not data.get('role'):
            return jsonify({'success': False, 'message': 'Rol requerido'}), 400
        
        if data['role'] not in ['admin', 'project_manager', 'team_member']:
            return jsonify({'success': False, 'message': 'Rol inválido'}), 400
        
        user, error = AuthService.update_user_role(user_id, data['role'])
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Rol de usuario actualizado exitosamente',
            'user': user
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Cambiar contraseña del usuario actual"""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'success': False, 'message': 'Contraseña actual y nueva son requeridas'}), 400
        
        success, message = AuthService.change_password(
            user_id=current_user_id,
            current_password=data['current_password'],
            new_password=data['new_password']
        )
        
        if not success:
            return jsonify({'success': False, 'message': message}), 400
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@users_bp.route('/users', methods=['POST'])
@require_role('admin')
def create_user():
    """Crear un nuevo usuario"""
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password') or not data.get('name') or not data.get('role'):
            return jsonify({'success': False, 'message': 'Faltan datos requeridos'}), 400
        user, error = AuthService.create_user(**data)
        if error:
            return jsonify({'success': False, 'message': error}), 400
        return jsonify({'success': True, 'user': user}), 201
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
