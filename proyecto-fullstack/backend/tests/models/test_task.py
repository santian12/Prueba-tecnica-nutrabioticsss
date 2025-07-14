from datetime import datetime, date
from backend.models.task import Task

class DummyComment:
    def __init__(self, id):
        self.id = id
    def to_dict(self):
        return {'id': self.id}

def test_to_dict_without_comments():
    task = Task(
        id='t1',
        title='Tarea 1',
        description='Desc',
        status='todo',
        priority='medium',
        project_id='p1',
        assigned_to='u1',
        due_date=date(2025, 7, 13),
        created_at=datetime(2025, 7, 1, 10, 0, 0),
        updated_at=datetime(2025, 7, 2, 10, 0, 0)
    )
    result = task.to_dict()
    assert result['id'] == 't1'
    assert result['title'] == 'Tarea 1'
    assert result['status'] == 'todo'
    assert result['priority'] == 'medium'
    assert result['project_id'] == 'p1'
    assert result['assigned_to'] == 'u1'
    assert result['due_date'] == '2025-07-13'
    assert result['created_at'] == '2025-07-01T10:00:00'
    assert result['updated_at'] == '2025-07-02T10:00:00'
    assert 'comments' not in result

def test_to_dict_with_comments():
    task = Task(
        id='t2',
        title='Tarea 2',
        description='Desc',
        status='done',
        priority='high',
        project_id='p2',
        assigned_to=None,
        due_date=None,
        created_at=datetime(2025, 7, 1, 10, 0, 0),
        updated_at=datetime(2025, 7, 2, 10, 0, 0)
    )
    task.comments = [DummyComment('c1'), DummyComment('c2')]
    result = task.to_dict(include_comments=True)
    assert 'comments' in result
    assert len(result['comments']) == 2
    assert result['comments'][0]['id'] == 'c1'
    assert result['comments'][1]['id'] == 'c2'

def test_repr():
    task = Task(title='Tarea X')
    assert repr(task) == '<Task Tarea X>'
