import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.user_routes import users_bp
from backend.services.auth_service import AuthService

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(users_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='admin-id')
    return {'Authorization': f'Bearer {token}'}

def test_get_all_users_admin_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'get_user_by_id', staticmethod(lambda uid: ({'id': uid, 'role': 'admin'}, None)))
    monkeypatch.setattr(AuthService, 'get_all_users', staticmethod(lambda: ([{'id': 'u1'}], None)))
    response = client.get('/users', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'data' in response.json

def test_get_all_users_not_admin(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'get_user_by_id', staticmethod(lambda uid: ({'id': uid, 'role': 'developer'}, None)))
    response = client.get('/users', headers=auth_headers())
    assert response.status_code == 403
    assert response.json['success'] is False

def test_get_user_profile_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'get_user_by_id', staticmethod(lambda uid: ({'id': uid}, None)))
    response = client.get('/users/profile', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'user' in response.json

def test_update_user_profile_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'update_user_profile', staticmethod(lambda uid, **data: ({'id': uid, **data}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/users/profile', json={'name': 'Nuevo'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_get_user_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'get_user_by_id', staticmethod(lambda uid: ({'id': uid}, None)))
    response = client.get('/users/u1', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_update_user_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'update_user_profile', staticmethod(lambda uid, **data: ({'id': uid, **data}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/users/u1', json={'name': 'Editado'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_user_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'delete_user', staticmethod(lambda uid: (True, 'Eliminado')))
    response = client.delete('/users/u1', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_update_user_role_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'update_user_role', staticmethod(lambda uid, role: ({'id': uid, 'role': role}, None)))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.put('/users/u1/role', json={'role': 'admin'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True

def test_change_password_success(client, monkeypatch):
    monkeypatch.setattr(AuthService, 'change_password', staticmethod(lambda user_id, current_password, new_password: (True, 'Cambiada')))
    headers = auth_headers()
    headers['Content-Type'] = 'application/json'
    response = client.post('/users/change-password', json={'current_password': 'old', 'new_password': 'new'}, headers=headers)
    assert response.status_code == 200
    assert response.json['success'] is True
