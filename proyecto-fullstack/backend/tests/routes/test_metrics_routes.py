import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.metrics_routes import metrics_bp
from backend.services.project_service import ProjectService
from backend.services.task_service import TaskService

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(metrics_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    # Simula un usuario autenticado
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='user-1')
    return {'Authorization': f'Bearer {token}'}

def test_get_general_metrics_success(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'get_all_projects_stats', staticmethod(lambda: ({'total_projects': 2}, None)))
    monkeypatch.setattr(TaskService, 'get_all_tasks_stats', staticmethod(lambda: ({'total_tasks': 5, 'completed_tasks': 2, 'in_progress_tasks': 1, 'pending_tasks': 2}, None)))
    response = client.get('/metrics/overview', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'data' in response.json

def test_get_projects_metrics_error(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'get_all_projects_stats', staticmethod(lambda: (None, 'Error'))) 
    response = client.get('/metrics/projects', headers=auth_headers())
    assert response.status_code == 500
    assert response.json['success'] is False

def test_get_tasks_metrics_with_filters(client, monkeypatch):
    def mock_get_tasks_stats(filters):
        return ({'total_tasks': 3}, None)
    monkeypatch.setattr(TaskService, 'get_tasks_stats', staticmethod(mock_get_tasks_stats))
    response = client.get('/metrics/tasks?project_id=abc&assigned_to=xyz', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'metrics' in response.json

def test_get_project_metrics_not_found(client, monkeypatch):
    monkeypatch.setattr(ProjectService, 'get_project_stats', staticmethod(lambda pid: (None, 'No encontrado')))
    response = client.get('/projects/123', headers=auth_headers())
    assert response.status_code == 404
    assert response.json['success'] is False
