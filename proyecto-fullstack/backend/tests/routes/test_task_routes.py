import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.task_routes import tasks_bp
from backend.services.task_service import TaskService

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(tasks_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='user-1')
    return {'Authorization': f'Bearer {token}'}

def test_get_tasks_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'get_all_tasks', staticmethod(lambda filters: ([{'id': 't1'}], None)))
    response = client.get('/tasks', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'data' in response.json

def test_get_task_not_found(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'get_task_by_id', staticmethod(lambda tid: (None, 'No encontrado')))
    response = client.get('/tasks/123', headers=auth_headers())
    assert response.status_code == 404
    assert response.json['success'] is False

def test_create_task_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'create_task', staticmethod(lambda **kwargs: ({'id': 't2'}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/tasks', json={'title': 'Nueva tarea', 'project_id': 'p1'}, headers=headers)
    assert response.status_code == 201
    assert response.json['success'] is True

def test_create_task_missing_title(client):
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/tasks', json={'project_id': 'p1'}, headers=headers)
    assert response.status_code == 400
    assert response.json['success'] is False

def test_create_task_missing_project_id(client):
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/tasks', json={'title': 'Tarea sin proyecto'}, headers=headers)
    assert response.status_code == 400
    assert response.json['success'] is False

def test_update_task_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'update_task', staticmethod(lambda tid, **data: ({'id': tid, **data}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/tasks/123', json={'title': 'Actualizada'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_task_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'delete_task', staticmethod(lambda tid: (True, 'Eliminada')))
    response = client.delete('/tasks/123', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_get_task_comments_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'get_task_comments', staticmethod(lambda tid: ([{'id': 'c1'}], None)))
    response = client.get('/tasks/123/comments', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'comments' in response.json

def test_add_task_comment_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'add_task_comment', staticmethod(lambda **kwargs: ({'id': 'c2'}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/tasks/123/comments', json={'content': 'Comentario'}, headers=headers)
    assert response.status_code == 201
    assert response.json['success'] is True

def test_update_comment_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'update_comment', staticmethod(lambda **kwargs: ({'id': 'c3'}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/tasks/comments/123', json={'content': 'Editado'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_comment_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'delete_comment', staticmethod(lambda cid, uid: (True, 'Eliminado')))
    response = client.delete('/tasks/comments/123', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
