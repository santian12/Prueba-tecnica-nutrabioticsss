
"""
Rutas para la gestión de notificaciones
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.notification_service import NotificationService

# Crear blueprint
notifications_bp = Blueprint('notifications', __name__, url_prefix='/notifications')

@notifications_bp.route('/delete-all', methods=['DELETE'])
@jwt_required()
def delete_all_notifications():
    """Eliminar todas las notificaciones del usuario autenticado"""
    from services.task_service import TaskService
    user_id = get_jwt_identity()
    success, message = TaskService.delete_all_user_notifications(user_id)
    if not success:
        return jsonify({'success': False, 'message': message}), 500
    return jsonify({'success': True, 'message': message}), 200


@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """
    Obtener notificaciones del usuario autenticado
    """
    try:
        user_id = get_jwt_identity()
        
        # Parámetros de consulta
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        # Obtener notificaciones
        notifications = NotificationService.get_user_notifications(
            user_id=user_id,
            limit=limit,
            offset=offset,
            unread_only=unread_only
        )
        
        # Obtener contador de no leídas
        unread_count = NotificationService.get_unread_count(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'notifications': notifications,
                'unread_count': unread_count,
                'total': len(notifications)
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener notificaciones: {str(e)}'
        }), 500


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """
    Obtener número de notificaciones no leídas
    """
    try:
        user_id = get_jwt_identity()
        unread_count = NotificationService.get_unread_count(user_id)
        
        return jsonify({
            'success': True,
            'data': {
                'unread_count': unread_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener contador de notificaciones: {str(e)}'
        }), 500


@notifications_bp.route('/<notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    """
    Marcar una notificación como leída
    """
    try:
        user_id = get_jwt_identity()
        
        success, message = NotificationService.mark_as_read(notification_id, user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al marcar notificación como leída: {str(e)}'
        }), 500


@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_as_read():
    """
    Marcar todas las notificaciones como leídas
    """
    try:
        user_id = get_jwt_identity()
        
        success, message = NotificationService.mark_all_as_read(user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al marcar todas las notificaciones como leídas: {str(e)}'
        }), 500


@notifications_bp.route('/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """
    Eliminar una notificación
    """
    try:
        user_id = get_jwt_identity()
        
        success, message = NotificationService.delete_notification(notification_id, user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': message
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': message
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al eliminar notificación: {str(e)}'
        }), 500


@notifications_bp.route('/create', methods=['POST'])
@jwt_required()
def create_notification():
    """
    Crear una nueva notificación (para testing o admin)
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No se proporcionaron datos'
            }), 400
        
        title = data.get('title')
        message = data.get('message')
        notification_type = data.get('type', 'info')
        category = data.get('category', 'system')
        
        if not title or not message:
            return jsonify({
                'success': False,
                'message': 'Título y mensaje son requeridos'
            }), 400
        
        success, result = NotificationService.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            category=category
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Notificación creada exitosamente',
                'data': result
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': result
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al crear notificación: {str(e)}'
        }), 500
