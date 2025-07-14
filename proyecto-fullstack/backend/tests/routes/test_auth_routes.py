import pytest
from flask import Flask
from flask_jwt_extended import create_access_token
from backend.routes.auth_routes import auth_bp
from backend.services.auth_service import AuthService

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    app.register_blueprint(auth_bp)
    return app

@pytest.fixture
def client(app):
    return app.test_client()

def test_register_success(client, monkeypatch):
    def mock_register(name, email, password, role):
        return ({'user': {'id': 1, 'name': name, 'email': email, 'role': role}, 'access_token': 'token', 'refresh_token': 'refresh'}, None)
    monkeypatch.setattr(AuthService, 'register', staticmethod(mock_register))
    response = client.post('/auth/register', json={
        'name': 'Test User',
        'email': 'test@example.com',
        'password': 'test1234',
        'role': 'developer'
    })
    assert response.status_code == 201
    assert response.json['success'] is True
    assert 'user' in response.json

def test_register_missing_fields(client):
    response = client.post('/auth/register', json={})
    assert response.status_code == 400
    assert response.json['success'] is False

def test_login_success(client, monkeypatch):
    def mock_login(email, password):
        return ({'user': {'id': 1, 'email': email}, 'access_token': 'token', 'refresh_token': 'refresh'}, None)
    monkeypatch.setattr(AuthService, 'login', staticmethod(mock_login))
    response = client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'test1234'
    })
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'user' in response.json

def test_login_missing_fields(client):
    response = client.post('/auth/login', json={})
    assert response.status_code == 400
    assert response.json['success'] is False

def test_forgot_password(client, monkeypatch):
    def mock_forgot_password(email):
        return True, 'Mensaje enviado'
    monkeypatch.setattr(AuthService, 'forgot_password', staticmethod(mock_forgot_password))
    response = client.post('/auth/forgot-password', json={'email': 'test@example.com'})
    assert response.status_code == 200
    assert response.json['success'] is True

def test_forgot_password_missing_email(client):
    response = client.post('/auth/forgot-password', json={})
    assert response.status_code == 400
    assert response.json['success'] is False

def test_verify_reset_token(client, monkeypatch):
    def mock_verify_reset_token(token):
        return True, 'Token válido'
    monkeypatch.setattr(AuthService, 'verify_reset_token', staticmethod(mock_verify_reset_token))
    response = client.post('/auth/verify-reset-token', json={'token': 'sometoken'})
    assert response.status_code == 200
    assert response.json['success'] is True

def test_verify_reset_token_missing_token(client):
    response = client.post('/auth/verify-reset-token', json={})
    assert response.status_code == 400
    assert response.json['success'] is False

def test_reset_password(client, monkeypatch):
    def mock_reset_password(token, password):
        return True, 'Contraseña cambiada'
    monkeypatch.setattr(AuthService, 'reset_password', staticmethod(mock_reset_password))
    response = client.post('/auth/reset-password', json={'token': 'sometoken', 'password': 'newpass'})
    assert response.status_code == 200
    assert response.json['success'] is True

def test_reset_password_missing_fields(client):
    response = client.post('/auth/reset-password', json={})
    assert response.status_code == 400
    assert response.json['success'] is False
