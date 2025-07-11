"""
Modelo de Token de Reseteo de Contraseña
"""
import uuid
from datetime import datetime, timedelta
from database import db

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relaciones
    user = db.relationship('User', backref='reset_tokens')

    def is_expired(self):
        """Verificar si el token ha expirado"""
        return datetime.utcnow() > self.expires_at

    def is_valid(self):
        """Verificar si el token es válido"""
        return not self.used and not self.is_expired()

    def __repr__(self):
        return f'<PasswordResetToken {self.token[:8]}...>'
