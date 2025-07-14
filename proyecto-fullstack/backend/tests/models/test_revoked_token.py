from backend.models.revoked_token import RevokedToken

def test_is_jti_blacklisted_found(monkeypatch):
    class DummyQuery:
        @staticmethod
        def filter_by(jti):
            class Result:
                @staticmethod
                def first():
                    return object()  # Simula que existe
            return Result
    monkeypatch.setattr(RevokedToken, 'query', DummyQuery)
    assert RevokedToken.is_jti_blacklisted('abc123') is True

def test_is_jti_blacklisted_not_found(monkeypatch):
    class DummyQuery:
        @staticmethod
        def filter_by(jti):
            class Result:
                @staticmethod
                def first():
                    return None  # Simula que no existe
            return Result
    monkeypatch.setattr(RevokedToken, 'query', DummyQuery)
    assert RevokedToken.is_jti_blacklisted('notfound') is False

def test_repr():
    token = RevokedToken(jti='xyz')
    assert repr(token) == '<RevokedToken xyz>'
