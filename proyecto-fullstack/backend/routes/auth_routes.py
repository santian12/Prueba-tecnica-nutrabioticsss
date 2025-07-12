"""
Rutas de autenticación
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from services.auth_service import AuthService
from utils.auth_decorators import require_role

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de nuevos usuarios"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Nombre, email y contraseña son requeridos'}), 400
        
        # Verificar email duplicado
        user_data, error = AuthService.register(
            name=data['name'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'developer')
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Usuario registrado exitosamente',
            'user': user_data['user'],
            'token': user_data['access_token'],
            'refresh_token': user_data['refresh_token']
        }), 201
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login de usuarios"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Email y contraseña son requeridos'}), 400
        
        auth_data, error = AuthService.login(data['email'], data['password'])
        
        if error:
            return jsonify({'success': False, 'message': error}), 401
        
        return jsonify({
            'success': True,
            'message': 'Login exitoso',
            'user': auth_data['user'],
            'token': auth_data['access_token'],
            'refresh_token': auth_data['refresh_token']
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refrescar token de acceso"""
    try:
        current_user_id = get_jwt_identity()
        auth_data, error = AuthService.refresh_token(current_user_id)
        
        if error:
            return jsonify({'success': False, 'message': error}), 401
        
        return jsonify({
            'success': True,
            'token': auth_data['access_token']
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout de usuarios"""
    try:
        jti = get_jwt()['jti']
        success, error = AuthService.logout(jti)
        
        if error:
            return jsonify({'success': False, 'message': error}), 500
        
        return jsonify({
            'success': True,
            'message': 'Logout exitoso'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Solicitar reseteo de contraseña"""
    try:
        data = request.get_json()
        
        if not data or not data.get('email'):
            return jsonify({'success': False, 'message': 'Email es requerido'}), 400
        
        success, message = AuthService.forgot_password(data['email'])
        
        # Siempre devolver el mismo mensaje por seguridad
        return jsonify({
            'success': True,
            'message': 'Si el email existe, se ha enviado un enlace de recuperación'
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/verify-reset-token', methods=['POST'])
def verify_reset_token():
    """Verificar token de reseteo"""
    try:
        data = request.get_json()
        
        if not data or not data.get('token'):
            return jsonify({'success': False, 'message': 'Token es requerido'}), 400
        
        success, message = AuthService.verify_reset_token(data['token'])
        
        if not success:
            return jsonify({'success': False, 'message': message}), 400
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Resetear contraseña"""
    try:
        data = request.get_json()
        
        if not data or not data.get('token') or not data.get('password'):
            return jsonify({'success': False, 'message': 'Token y nueva contraseña son requeridos'}), 400
        
        success, message = AuthService.reset_password(data['token'], data['password'])
        
        if not success:
            return jsonify({'success': False, 'message': message}), 400
        
        return jsonify({
            'success': True,
            'message': message
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario"""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No se proporcionaron datos para actualizar'}), 400
        
        user_data, error = AuthService.update_profile(
            user_id=current_user_id,
            name=data.get('name'),
            email=data.get('email'),
            password=data.get('password')
        )
        
        if error:
            return jsonify({'success': False, 'message': error}), 400
        
        return jsonify({
            'success': True,
            'message': 'Perfil actualizado exitosamente',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Obtener información del usuario actual"""
    try:
        current_user_id = get_jwt_identity()
        from models.user import User
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error en el servidor: {str(e)}'}), 500
