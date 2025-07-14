import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.notification_routes import notifications_bp
from backend.services.notification_service import NotificationService

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(notifications_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='user-1')
    return {'Authorization': f'Bearer {token}'}

def test_get_notifications_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'get_user_notifications', staticmethod(lambda user_id, limit, offset, unread_only: [{'id': 'n1'}]))
    monkeypatch.setattr(NotificationService, 'get_unread_count', staticmethod(lambda user_id: 2))
    response = client.get('/notifications', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert 'notifications' in response.json['data']
    assert 'unread_count' in response.json['data']

def test_get_unread_count_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'get_unread_count', staticmethod(lambda user_id: 3))
    response = client.get('/notifications/unread-count', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True
    assert response.json['data']['unread_count'] == 3

def test_mark_notification_as_read_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'mark_as_read', staticmethod(lambda nid, uid: (True, 'Marcada como leída')))
    response = client.put('/notifications/n1/read', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_mark_notification_as_read_not_found(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'mark_as_read', staticmethod(lambda nid, uid: (False, 'No encontrada')))
    response = client.put('/notifications/n2/read', headers=auth_headers())
    assert response.status_code == 404
    assert response.json['success'] is False

def test_mark_all_notifications_as_read_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'mark_all_as_read', staticmethod(lambda uid: (True, 'Todas leídas')))
    response = client.put('/notifications/mark-all-read', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_notification_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'delete_notification', staticmethod(lambda nid, uid: (True, 'Eliminada')))
    response = client.delete('/notifications/n1', headers=auth_headers())
    assert response.status_code == 200
    assert response.json['success'] is True

def test_delete_notification_not_found(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'delete_notification', staticmethod(lambda nid, uid: (False, 'No encontrada')))
    response = client.delete('/notifications/n2', headers=auth_headers())
    assert response.status_code == 404
    assert response.json['success'] is False

def test_create_notification_success(client, monkeypatch):
    monkeypatch.setattr(NotificationService, 'create_notification', staticmethod(lambda **kwargs: (True, {'id': 'n1'})))
    response = client.post('/notifications/create', json={
        'title': 'Test',
        'message': 'Mensaje',
        'type': 'info',
        'category': 'system'
    }, headers=auth_headers())
    assert response.status_code == 201
    assert response.json['success'] is True

def test_create_notification_missing_fields(client):
    response = client.post('/notifications/create', json={}, headers=auth_headers())
    assert response.status_code == 400
    assert response.json['success'] is False
