import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.project_routes import projects_bp
from backend.services.project_service import ProjectService
from backend.services.task_service import TaskService

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(projects_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='user-1')
    return {'Authorization': f'Bearer {token}'}

def test_get_projects_success(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'get_all_projects', staticmethod(lambda: ([{'id': 'p1'}], None)))
    response = client.get('/projects', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'projects' in response.json

def test_get_project_not_found(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'get_project_by_id', staticmethod(lambda pid: (None, 'No encontrado')))
    response = client.get('/projects/123', headers=auth_headers())
    assert response.status_code == 404
    assert response.json['success'] is False

def test_create_project_success(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'create_project', staticmethod(lambda **kwargs: ({'id': 'p2'}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/projects', json={'name': 'Nuevo Proyecto'}, headers=headers)
    assert response.status_code == 201
    assert response.json['success'] is True

def test_create_project_missing_name(client):
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/projects', json={}, headers=headers)
    assert response.status_code == 400
    assert response.json['success'] is False

def test_update_project_success(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'update_project', staticmethod(lambda pid, **data: ({'id': pid, **data}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/projects/123', json={'name': 'Actualizado'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_project_success(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'delete_project', staticmethod(lambda pid: (True, 'Eliminado')))
    response = client.delete('/projects/123', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_get_project_tasks_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'get_tasks_by_project', staticmethod(lambda pid: ([{'id': 't1'}], None)))
    response = client.get('/projects/123/tasks', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'tasks' in response.json

def test_create_project_task_success(client, monkeypatch):
    monkeypatch.setattr(TaskService, 'create_task', staticmethod(lambda **kwargs: ({'id': 't2'}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/projects/123/tasks', json={'title': 'Nueva tarea'}, headers=headers)
    assert response.status_code == 201
    assert response.json['success'] is True

def test_create_project_task_missing_title(client):
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/projects/123/tasks', json={}, headers=headers)
    assert response.status_code == 400
    assert response.json['success'] is False
