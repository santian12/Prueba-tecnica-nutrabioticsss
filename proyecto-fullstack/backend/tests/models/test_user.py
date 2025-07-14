from datetime import datetime
from backend.models.user import User

class DummyHash:
    def __init__(self):
        self.value = None
    def __call__(self, password):
        return f'hash-{password}'

def test_set_and_check_password(monkeypatch):
    user = User(email='test@example.com')
    # Mock generate_password_hash and check_password_hash
    monkeypatch.setattr('backend.models.user.generate_password_hash', lambda p: f'hash-{p}')
    monkeypatch.setattr('backend.models.user.check_password_hash', lambda h, p: h == f'hash-{p}')
    user.set_password('abc123')
    assert user.password_hash == 'hash-abc123'
    assert user.check_password('abc123') is True
    assert user.check_password('wrong') is False

def test_to_dict():
    user = User(
        id='u1',
        name='Juan',
        email='juan@example.com',
        role='admin',
        is_active=True,
        created_at=datetime(2025, 7, 1, 10, 0, 0),
        updated_at=datetime(2025, 7, 2, 10, 0, 0)
    )
    result = user.to_dict()
    assert result['id'] == 'u1'
    assert result['name'] == 'Juan'
    assert result['email'] == 'juan@example.com'
    assert result['role'] == 'admin'
    assert result['is_active'] is True
    assert result['created_at'] == '2025-07-01T10:00:00'
    assert result['updated_at'] == '2025-07-02T10:00:00'

def test_repr():
    user = User(email='test@correo.com')
    assert repr(user) == '<User test@correo.com>'
