"""
Decoradores y middlewares para autenticación y autorización
"""
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify
from models.user import User
from models.revoked_token import RevokedToken

def require_role(*allowed_roles):
    """Decorador para validar roles de usuario"""
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or user.role not in allowed_roles:
                return jsonify({'success': False, 'message': 'Acceso denegado'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def check_if_token_revoked(jwt_header, jwt_payload):
    """Verificar si un token está en la blacklist"""
    jti = jwt_payload['jti']
    return RevokedToken.is_jti_blacklisted(jti)
