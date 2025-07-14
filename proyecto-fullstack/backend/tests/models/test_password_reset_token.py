from datetime import datetime, timedelta
from backend.models.password_reset_token import PasswordResetToken

class DummyUser:
    def __init__(self, name):
        self.name = name

def test_is_expired_true():
    token = PasswordResetToken(
        token='abc',
        user_id='user-1',
        expires_at=datetime.utcnow() - timedelta(hours=1),
        used=False
    )
    assert token.is_expired() is True

def test_is_expired_false():
    token = PasswordResetToken(
        token='abc',
        user_id='user-1',
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False
    )
    assert token.is_expired() is False

def test_is_valid_true():
    token = PasswordResetToken(
        token='abc',
        user_id='user-1',
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=False
    )
    assert token.is_valid() is True

def test_is_valid_false_used():
    token = PasswordResetToken(
        token='abc',
        user_id='user-1',
        expires_at=datetime.utcnow() + timedelta(hours=1),
        used=True
    )
    assert token.is_valid() is False

def test_is_valid_false_expired():
    token = PasswordResetToken(
        token='abc',
        user_id='user-1',
        expires_at=datetime.utcnow() - timedelta(hours=1),
        used=False
    )
    assert token.is_valid() is False

def test_repr():
    token = PasswordResetToken(token='abcdefgh12345678', user_id='user-1', expires_at=datetime.utcnow(), used=False)
    assert repr(token).startswith('<PasswordResetToken abcdefgh')
