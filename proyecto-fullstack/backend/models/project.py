"""
Modelo de Proyecto
"""
import uuid
from database import db

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.Enum('planning', 'active', 'on_hold', 'completed', 'cancelled', 
                              name='project_status'), nullable=False, default='planning')
    priority = db.Column(db.Enum('low', 'medium', 'high', name='project_priority'), 
                        nullable=False, default='medium')
    end_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), 
                          onupdate=db.func.current_timestamp())
    
    # Relaciones
    tasks = db.relationship('Task', backref='project', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_tasks=False):
        """Convertir a diccionario"""
        result = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_tasks:
            result['tasks'] = [task.to_dict() for task in self.tasks]
            
        return result

    def __repr__(self):
        return f'<Project {self.name}>'
