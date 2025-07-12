"""
Aplicación principal - Orquestador de microservicios
Sistema de Gestión de Proyectos refactorizado en arquitectura de microservicios
"""
import os
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from datetime import timedelta
from werkzeug.security import generate_password_hash
from sqlalchemy import text

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
from models.notification import Notification

# Importar blueprints de rutas (microservicios)
from routes.auth_routes import auth_bp
from routes.project_routes import projects_bp
from routes.task_routes import tasks_bp
from routes.user_routes import users_bp
from routes.metrics_routes import metrics_bp
from routes.pdf_routes import pdf_bp
from routes.notification_routes import notifications_bp

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
    
    # Configurar CORS de manera más robusta
    CORS(app, 
         origins=['http://localhost:3000'], 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
         expose_headers=['Content-Range', 'X-Content-Range'],
         send_wildcard=False
    )
    
    # Manejo específico para OPTIONS requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
            response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With,Accept")
            response.headers.add('Access-Control-Allow-Methods', "GET,POST,PUT,DELETE,OPTIONS,PATCH")
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response
    
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
    app.register_blueprint(auth_bp, url_prefix='/api')           # Autenticación (/api/auth)
    app.register_blueprint(projects_bp, url_prefix='/api')       # Gestión de proyectos (/api/projects)
    app.register_blueprint(tasks_bp, url_prefix='/api')          # Gestión de tareas (/api/tasks)
    app.register_blueprint(users_bp, url_prefix='/api')          # Gestión de usuarios (/api/users)
    app.register_blueprint(metrics_bp, url_prefix='/api')        # Métricas y estadísticas (/api/metrics)
    app.register_blueprint(pdf_bp, url_prefix='/api')            # Exportación PDF (/api/pdf)
    app.register_blueprint(notifications_bp, url_prefix='/api')  # Gestión de notificaciones (/api/notifications)
    
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
                'pdf': 'activo',
                'notifications': 'activo'
            }
        }), 200
    
    # Endpoint de diagnóstico de base de datos
    @app.route('/debug/db-info', methods=['GET'])
    def debug_db_info():
        """Endpoint de diagnóstico para verificar qué base de datos está usando"""
        try:
            # Obtener información de la configuración
            db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', 'No configurado')
            flask_env = os.getenv('FLASK_ENV', 'No configurado')
            
            # Verificar conexión y obtener información de la base de datos
            with db.engine.connect() as connection:
                # Para PostgreSQL
                if 'postgresql' in db_uri:
                    result = connection.execute(text("SELECT version();"))
                    db_version = result.fetchone()[0]
                    
                    # Contar registros
                    users_count = connection.execute(text("SELECT COUNT(*) FROM users;")).fetchone()[0]
                    projects_count = connection.execute(text("SELECT COUNT(*) FROM projects;")).fetchone()[0]
                    tasks_count = connection.execute(text("SELECT COUNT(*) FROM tasks;")).fetchone()[0]
                    
                # Para SQLite
                else:
                    result = connection.execute(text("SELECT sqlite_version();"))
                    db_version = f"SQLite {result.fetchone()[0]}"
                    
                    # Contar registros
                    users_count = connection.execute(text("SELECT COUNT(*) FROM users;")).fetchone()[0]
                    projects_count = connection.execute(text("SELECT COUNT(*) FROM projects;")).fetchone()[0]
                    tasks_count = connection.execute(text("SELECT COUNT(*) FROM tasks;")).fetchone()[0]
            
            return jsonify({
                'success': True,
                'database_uri': db_uri,
                'flask_env': flask_env,
                'database_version': db_version,
                'connection_status': 'OK',
                'data_counts': {
                    'users': users_count,
                    'projects': projects_count,
                    'tasks': tasks_count
                }
            }), 200
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'database_uri': app.config.get('SQLALCHEMY_DATABASE_URI', 'No configurado'),
                'flask_env': os.getenv('FLASK_ENV', 'No configurado'),
                'connection_status': 'ERROR'
            }), 500
    
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
                'notifications': '/notifications',
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
