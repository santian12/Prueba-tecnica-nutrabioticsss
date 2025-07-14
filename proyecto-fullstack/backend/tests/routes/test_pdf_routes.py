import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from backend.routes.pdf_routes import pdf_bp
from backend.services.pdf_service import PDFService
import os

@pytest.fixture
def app(monkeypatch):
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = 'test-secret'
    JWTManager(app)
    app.register_blueprint(pdf_bp)
    return app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

def auth_headers():
    from flask_jwt_extended import create_access_token
    token = create_access_token(identity='user-1')
    return {'Authorization': f'Bearer {token}'}

def test_generate_project_report_success(client, monkeypatch, tmp_path):
    fake_pdf = tmp_path / 'test.pdf'
    fake_pdf.write_bytes(b'%PDF-1.4')
    monkeypatch.setattr(PDFService, 'generate_project_report', staticmethod(lambda pid: (str(fake_pdf), None)))
    response = client.get('/pdf/report/project/123', headers=auth_headers())
    assert response.status_code == 200
    assert response.mimetype == 'application/pdf'

def test_generate_project_report_error(client, monkeypatch):
    monkeypatch.setattr(PDFService, 'generate_project_report', staticmethod(lambda pid: (None, 'Error')))
    response = client.get('/pdf/report/project/123', headers=auth_headers())
    assert response.status_code == 400
    assert response.json['success'] is False

def test_generate_tasks_report_success(client, monkeypatch, tmp_path):
    fake_pdf = tmp_path / 'tasks.pdf'
    fake_pdf.write_bytes(b'%PDF-1.4')
    monkeypatch.setattr(PDFService, 'generate_tasks_report', staticmethod(lambda filters: (str(fake_pdf), None)))
    response = client.get('/pdf/report/tasks', headers=auth_headers())
    assert response.status_code == 200
    assert response.mimetype == 'application/pdf'

def test_generate_general_report_error(client, monkeypatch):
    monkeypatch.setattr(PDFService, 'generate_general_report', staticmethod(lambda: (None, 'Error')))
    response = client.get('/pdf/report/general', headers=auth_headers())
    assert response.status_code == 400
    assert response.json['success'] is False

def test_generate_metrics_report_success(client, monkeypatch, tmp_path):
    fake_pdf = tmp_path / 'metrics.pdf'
    fake_pdf.write_bytes(b'%PDF-1.4')
    monkeypatch.setattr(PDFService, 'generate_metrics_report', staticmethod(lambda filters, charts: (str(fake_pdf), None)))
    response = client.get('/pdf/report/metrics', headers=auth_headers())
    assert response.status_code == 200
    assert response.mimetype == 'application/pdf'

def test_generate_custom_report_missing_config(client):
    response = client.post('/pdf/report/custom', json=None, headers=auth_headers())
    assert response.status_code == 400
    assert response.json['success'] is False
