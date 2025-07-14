from datetime import datetime, date
from backend.models.project import Project

class DummyTask:
    def __init__(self, id):
        self.id = id
    def to_dict(self):
        return {'id': self.id}

def test_to_dict_without_tasks():
    project = Project(
        id='p1',
        name='Proyecto X',
        description='Desc',
        status='planning',
        priority='medium',
        end_date=date(2025, 7, 13),
        created_by='user-1',
        created_at=datetime(2025, 7, 1, 10, 0, 0),
        updated_at=datetime(2025, 7, 2, 10, 0, 0)
    )
    result = project.to_dict()
    assert result['id'] == 'p1'
    assert result['name'] == 'Proyecto X'
    assert result['status'] == 'planning'
    assert result['priority'] == 'medium'
    assert result['end_date'] == '2025-07-13'
    assert result['created_by'] == 'user-1'
    assert result['created_at'] == '2025-07-01T10:00:00'
    assert result['updated_at'] == '2025-07-02T10:00:00'
    assert 'tasks' not in result

def test_to_dict_with_tasks():
    project = Project(
        id='p2',
        name='Proyecto Y',
        description='Desc',
        status='active',
        priority='high',
        end_date=None,
        created_by='user-2',
        created_at=datetime(2025, 7, 1, 10, 0, 0),
        updated_at=datetime(2025, 7, 2, 10, 0, 0)
    )
    project.tasks = [DummyTask('t1'), DummyTask('t2')]
    result = project.to_dict(include_tasks=True)
    assert 'tasks' in result
    assert len(result['tasks']) == 2
    assert result['tasks'][0]['id'] == 't1'
    assert result['tasks'][1]['id'] == 't2'

def test_repr():
    project = Project(name='Proyecto Z')
    assert repr(project) == '<Project Proyecto Z>'
