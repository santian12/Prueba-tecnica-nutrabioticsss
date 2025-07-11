"""
Modelo de Comentario
"""
import uuid
from database import db

class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    content = db.Column(db.Text, nullable=False)
    task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=False)
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), 
                          onupdate=db.func.current_timestamp())

    def to_dict(self):
        """Convertir a diccionario"""
        return {
            'id': self.id,
            'content': self.content,
            'task_id': self.task_id,
            'author_id': self.author_id,
            'author_name': self.author.name if self.author else None,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f'<Comment {self.id}>'
