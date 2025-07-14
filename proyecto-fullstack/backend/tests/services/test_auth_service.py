import pytest
from unittest.mock import patch, MagicMock
from services.auth_service import AuthService

class DummyUser:
    def __init__(self, id=1, name='Test', email='test@example.com', role='developer', is_active=True):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.is_active = is_active
        self.password = 'hashed'
    def set_password(self, password):
        self.password = f'hashed_{password}'
    def check_password(self, password):
        return password == 'correctpassword'
    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'email': self.email, 'role': self.role}

@pytest.fixture
def dummy_user():
    return DummyUser()

@patch('services.auth_service.User')
@patch('services.auth_service.create_access_token')
@patch('services.auth_service.create_refresh_token')
def test_login_success(mock_refresh, mock_access, mock_user, dummy_user):
    mock_user.query.filter_by.return_value.first.return_value = dummy_user
    mock_access.return_value = 'access_token'
    mock_refresh.return_value = 'refresh_token'
    result, error = AuthService.login('test@example.com', 'correctpassword')
    assert error is None
    assert result['user']['email'] == 'test@example.com'
    assert result['access_token'] == 'access_token'
    assert result['refresh_token'] == 'refresh_token'

@patch('services.auth_service.User')
def test_login_user_not_found(mock_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    result, error = AuthService.login('notfound@example.com', 'any')
    assert result is None
    assert error == 'Usuario no encontrado'

@patch('services.auth_service.User')
def test_login_wrong_password(mock_user, dummy_user):
    dummy_user.check_password = MagicMock(return_value=False)
    mock_user.query.filter_by.return_value.first.return_value = dummy_user
    result, error = AuthService.login('test@example.com', 'wrongpassword')
    assert result is None
    assert error == 'Contraseña incorrecta'

@patch('services.auth_service.db')
@patch('services.auth_service.User')
@patch('services.auth_service.create_access_token')
@patch('services.auth_service.create_refresh_token')
def test_register_success(mock_refresh, mock_access, mock_user, mock_db, dummy_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    mock_user.return_value = dummy_user
    mock_access.return_value = 'access_token'
    mock_refresh.return_value = 'refresh_token'
    mock_db.session.add.return_value = None
    mock_db.session.commit.return_value = None
    result, error = AuthService.register('Test', 'test@example.com', '1234')
    assert error is None
    assert result['user']['email'] == 'test@example.com'
    assert result['access_token'] == 'access_token'
    assert result['refresh_token'] == 'refresh_token'

@patch('services.auth_service.User')
def test_register_email_exists(mock_user):
    mock_user.query.filter_by.return_value.first.return_value = DummyUser()
    result, error = AuthService.register('Test', 'test@example.com', '1234')
    assert result is None
    assert error == 'El email ya está registrado'

@patch('services.auth_service.db')
@patch('services.auth_service.User')
def test_register_db_error(mock_user, mock_db, dummy_user):
    mock_user.query.filter_by.return_value.first.return_value = None
    mock_user.return_value = dummy_user
    mock_db.session.add.side_effect = Exception('DB error')
    mock_db.session.rollback.return_value = None
    result, error = AuthService.register('Test', 'test@example.com', '1234')
    assert result is None
    assert 'Error al crear usuario' in error
