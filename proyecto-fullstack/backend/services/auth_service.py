"""
Servicios de autenticación
"""
import secrets
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token, create_refresh_token
from werkzeug.security import check_password_hash
from database import db
from models.user import User
from models.password_reset_token import PasswordResetToken
from models.revoked_token import RevokedToken
from utils.email_service import send_password_reset_email

class AuthService:
    @staticmethod
    def login(email, password):
        """Autenticar usuario"""
        user = User.query.filter_by(email=email, is_active=True).first()
        
        if not user or not user.check_password(password):
            return None, "Credenciales inválidas"
        
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, None

    @staticmethod
    def register(name, email, password, role='developer'):
        """Registrar nuevo usuario"""
        # Verificar si el usuario ya existe
        if User.query.filter_by(email=email).first():
            return None, "El email ya está registrado"
        
        # Crear nuevo usuario
        user = User(
            name=name,
            email=email,
            role=role
        )
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            return user.to_dict(), None
        except Exception as e:
            db.session.rollback()
            return None, f"Error al crear usuario: {str(e)}"

    @staticmethod
    def refresh_token(user_id):
        """Refrescar token de acceso"""
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return None, "Usuario no encontrado o inactivo"
        
        access_token = create_access_token(identity=user.id)
        return {'access_token': access_token}, None

    @staticmethod
    def logout(jti):
        """Cerrar sesión revocando el token"""
        try:
            revoked_token = RevokedToken(jti=jti)
            db.session.add(revoked_token)
            db.session.commit()
            return True, None
        except Exception as e:
            db.session.rollback()
            return False, f"Error al revocar token: {str(e)}"

    @staticmethod
    def forgot_password(email):
        """Solicitar reseteo de contraseña"""
        user = User.query.filter_by(email=email, is_active=True).first()
        if not user:
            return False, "Usuario no encontrado"
        
        # Generar token único
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        # Crear token de reseteo
        password_reset = PasswordResetToken(
            token=reset_token,
            user_id=user.id,
            expires_at=expires_at
        )
        
        try:
            db.session.add(password_reset)
            db.session.commit()
            
            # Enviar email
            email_sent = send_password_reset_email(user.email, user.name, reset_token)
            
            return True, "Email de recuperación enviado"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al generar token: {str(e)}"

    @staticmethod
    def verify_reset_token(token):
        """Verificar token de reseteo"""
        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        
        if not reset_token:
            return False, "Token no encontrado"
        
        if not reset_token.is_valid():
            return False, "Token expirado o ya usado"
        
        return True, "Token válido"

    @staticmethod
    def reset_password(token, new_password):
        """Resetear contraseña usando token"""
        reset_token = PasswordResetToken.query.filter_by(token=token).first()
        
        if not reset_token or not reset_token.is_valid():
            return False, "Token inválido o expirado"
        
        try:
            # Actualizar contraseña
            user = User.query.get(reset_token.user_id)
            user.set_password(new_password)
            
            # Marcar token como usado
            reset_token.used = True
            
            db.session.commit()
            return True, "Contraseña actualizada exitosamente"
        except Exception as e:
            db.session.rollback()
            return False, f"Error al actualizar contraseña: {str(e)}"
