"""
Modelo de Token Revocado
"""
import uuid
from database import db

class RevokedToken(db.Model):
    __tablename__ = 'revoked_tokens'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    jti = db.Column(db.String(120), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    @classmethod
    def is_jti_blacklisted(cls, jti):
        """Verificar si un JTI está en la blacklist"""
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)

    def __repr__(self):
        return f'<RevokedToken {self.jti}>'
