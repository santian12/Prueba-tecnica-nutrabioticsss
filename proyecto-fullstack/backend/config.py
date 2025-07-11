"""
Configuración centralizada de la aplicación
"""
import os
from datetime import timedelta

class Config:
    """Configuración base"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'tu-secret-key-muy-seguro')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'tu-jwt-secret-key-muy-seguro')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Email configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
    MAIL_FROM = os.getenv('MAIL_FROM', 'noreply@nutrabiotics.com')

class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(basedir, "nutrabiotics.db")}'

class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL', 
        'postgresql://nutrabiotics_user:password123@postgres:5432/nutrabiotics_db'
    )

class TestingConfig(Config):
    """Configuración para testing"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

# Mapeo de configuraciones
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Obtener configuración basada en el entorno"""
    env = os.getenv('ENVIRONMENT', 'development')
    return config.get(env, config['default'])
