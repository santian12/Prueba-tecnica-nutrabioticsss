"""
Aplicación principal - Orquestador de microservicios
Sistema de Gestión de Proyectos refactorizado en arquitectura de microservicios
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from datetime import timedelta
from werkzeug.security import generate_password_hash

# Importar configuración y base de datos
from config import config
from database import db, migrate

# Importar modelos (para que SQLAlchemy los reconozca)
from models.user import User
from models.project import Project
from models.task import Task
from models.comment import Comment
from models.password_reset_token import PasswordResetToken
from models.revoked_token import RevokedToken

# Importar blueprints de rutas (microservicios)
from routes.auth_routes import auth_bp
from routes.project_routes import projects_bp
from routes.task_routes import tasks_bp
from routes.user_routes import users_bp
from routes.metrics_routes import metrics_bp
from routes.pdf_routes import pdf_bp

# Importar utilidades
from utils.auth_decorators import check_if_token_revoked

def create_app(config_name=None):
    """Factory function para crear la aplicación Flask"""
    
    # Crear instancia de Flask
    app = Flask(__name__)
    
    # Configuración
    config_name = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[config_name])
    
    # Configuraciones adicionales para JWT
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configurar CORS
    CORS(app, origins=['http://localhost:3000'], supports_credentials=True)
    
    # Configurar JWT
    jwt = JWTManager(app)
    
    # Configurar verificación de tokens revocados
    @jwt.token_in_blocklist_loader
    def check_if_token_is_revoked(jwt_header, jwt_payload):
        return check_if_token_revoked(jwt_header, jwt_payload)
    
    # Configurar respuestas de error JWT personalizadas
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token expirado'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Token inválido'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Token de autorización requerido'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token revocado'
        }), 401
    
    # Configurar Mail si está disponible
    if app.config.get('MAIL_SERVER'):
        mail = Mail(app)
        app.mail = mail
    
    # Registrar blueprints (microservicios)
    app.register_blueprint(auth_bp)           # Autenticación (/auth)
    app.register_blueprint(projects_bp)       # Gestión de proyectos (/projects)
    app.register_blueprint(tasks_bp)          # Gestión de tareas (/tasks)
    app.register_blueprint(users_bp)          # Gestión de usuarios (/users)
    app.register_blueprint(metrics_bp)        # Métricas y estadísticas (/metrics)
    app.register_blueprint(pdf_bp)            # Exportación PDF (/pdf)
    
    # Ruta de salud del sistema
    @app.route('/health', methods=['GET'])
    def health_check():
        """Endpoint para verificar el estado del sistema"""
        return jsonify({
            'success': True,
            'message': 'Sistema funcionando correctamente',
            'version': '1.0.0',
            'architecture': 'microservices',
            'microservices': {
                'auth': 'activo',
                'projects': 'activo',
                'tasks': 'activo',
                'users': 'activo',
                'metrics': 'activo',
                'pdf': 'activo'
            }
        }), 200
    
    # Ruta raíz con información de la API
    @app.route('/', methods=['GET'])
    def root():
        """Endpoint raíz con información de la API"""
        return jsonify({
            'success': True,
            'message': 'API de Gestión de Proyectos - Arquitectura Microservicios',
            'version': '1.0.0',
            'description': 'Sistema de gestión de proyectos y tareas con arquitectura modular',
            'endpoints': {
                'authentication': '/auth',
                'projects': '/projects',
                'tasks': '/tasks',
                'users': '/users',
                'metrics': '/metrics',
                'pdf_reports': '/pdf',
                'health_check': '/health'
            },
            'features': [
                'Autenticación JWT',
                'Gestión de proyectos',
                'Gestión de tareas',
                'Sistema de comentarios',
                'Métricas y estadísticas',
                'Exportación PDF',
                'Control de roles'
            ]
        }), 200
    
    # Manejo de errores globales
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint no encontrado',
            'available_endpoints': ['/auth', '/projects', '/tasks', '/users', '/metrics', '/pdf', '/health']
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': 'Error interno del servidor'
        }), 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': 'Solicitud incorrecta'
        }), 400
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'message': 'Acceso denegado'
        }), 403
    
    # Crear tablas en modo desarrollo
    with app.app_context():
        if config_name == 'development':
            try:
                db.create_all()
                print("✅ Base de datos inicializada correctamente")
                
                # Crear usuario admin por defecto si no existe
                admin = User.query.filter_by(email='admin@nutrabiotics.com').first()
                if not admin:
                    admin = User(
                        username='admin',
                        email='admin@nutrabiotics.com',
                        password_hash=generate_password_hash('admin123'),
                        role='admin',
                        first_name='Administrador',
                        last_name='Sistema'
                    )
                    db.session.add(admin)
                    db.session.commit()
                    print("✅ Usuario administrador creado: admin@nutrabiotics.com / admin123")
                
            except Exception as e:
                print(f"❌ Error inicializando base de datos: {e}")
    
    return app

# Crear aplicación
app = create_app()

if __name__ == '__main__':
    # Configuración para desarrollo
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print("\n" + "="*60)
    print("🚀 SISTEMA DE GESTIÓN DE PROYECTOS - NUTRABIOTICS")
    print("="*60)
    print("📋 ARQUITECTURA: Microservicios")
    print(f"📡 Puerto: {port}")
    print(f"🔧 Modo: {'Desarrollo' if debug else 'Producción'}")
    print(f"🌐 URL: http://localhost:{port}")
    print("="*60)
    print("\n📦 MICROSERVICIOS DISPONIBLES:")
    print("   🔐 Autenticación:     /auth")
    print("   📁 Proyectos:        /projects")
    print("   ✅ Tareas:           /tasks")
    print("   👥 Usuarios:         /users")
    print("   📊 Métricas:         /metrics")
    print("   📄 Reportes PDF:     /pdf")
    print("   ❤️  Health Check:    /health")
    print("="*60)
    print("\n🔑 CREDENCIALES ADMIN:")
    print("   📧 Email: admin@nutrabiotics.com")
    print("   🔒 Password: admin123")
    print("="*60 + "\n")
    
    try:
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido por el usuario")
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")
