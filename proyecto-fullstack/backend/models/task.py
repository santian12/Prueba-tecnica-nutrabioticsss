"""
Modelo de Tarea
"""
import uuid
from database import db

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum('todo', 'in_progress', 'review', 'done', name='task_status'), 
                      nullable=False, default='todo')
    priority = db.Column(db.Enum('low', 'medium', 'high', name='task_priority'), 
                        nullable=False, default='medium')
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), 
                          onupdate=db.func.current_timestamp())
    
    # Relaciones
    comments = db.relationship('Comment', backref='task', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_comments=False):
        """Convertir a diccionario"""
        result = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'project_id': self.project_id,
            'assigned_to': self.assigned_to,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_comments:
            result['comments'] = [comment.to_dict() for comment in self.comments]
            
        return result

    def __repr__(self):
        return f'<Task {self.title}>'
