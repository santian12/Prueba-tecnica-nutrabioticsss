import pytest
from datetime import datetime
from backend.models.comment import Comment

class DummyAuthor:
    def __init__(self, name):
        self.name = name

def test_to_dict_with_author():
    comment = Comment(
        id='123',
        content='Comentario de prueba',
        task_id='task-1',
        author_id='user-1',
        is_deleted=False,
        created_at=datetime(2023, 1, 1, 12, 0, 0),
        updated_at=datetime(2023, 1, 2, 12, 0, 0)
    )
    comment.author = DummyAuthor('Juan')
    result = comment.to_dict()
    assert result['id'] == '123'
    assert result['content'] == 'Comentario de prueba'
    assert result['task_id'] == 'task-1'
    assert result['author_id'] == 'user-1'
    assert result['author_name'] == 'Juan'
    assert result['is_deleted'] is False
    assert result['created_at'] == '2023-01-01T12:00:00'
    assert result['updated_at'] == '2023-01-02T12:00:00'

def test_to_dict_without_author():
    comment = Comment(
        id='124',
        content='Otro comentario',
        task_id='task-2',
        author_id='user-2',
        is_deleted=True,
        created_at=None,
        updated_at=None
    )
    comment.author = None
    result = comment.to_dict()
    assert result['author_name'] is None
    assert result['created_at'] is None
    assert result['updated_at'] is None

def test_repr():
    comment = Comment(id='abc')
    assert repr(comment) == '<Comment abc>'
