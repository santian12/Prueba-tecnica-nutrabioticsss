"""
Servicio de envío de emails
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def send_password_reset_email(user_email, user_name, reset_token):
    """Envía email de recuperación de contraseña (simulado para desarrollo)"""
    try:
        # En desarrollo, solo imprimimos el email
        print(f"=== PASSWORD RESET EMAIL ===")
        print(f"Para: {user_email}")
        print(f"Nombre: {user_name}")
        print(f"Token: {reset_token}")
        print(f"URL de reseteo: http://localhost:3000/auth/reset-password?token={reset_token}")
        print("================================")
        
        # En producción, aquí irían las configuraciones SMTP reales
        # smtp_server = os.getenv('SMTP_SERVER')
        # smtp_port = int(os.getenv('SMTP_PORT', 587))
        # smtp_username = os.getenv('SMTP_USERNAME')
        # smtp_password = os.getenv('SMTP_PASSWORD')
        
        return True
        
    except Exception as e:
        print(f"Error enviando email: {str(e)}")
        return False

def send_notification_email(to_email, subject, message):
    """Envía email de notificación general"""
    try:
        # Implementación simulada para desarrollo
        print(f"=== NOTIFICATION EMAIL ===")
        print(f"Para: {to_email}")
        print(f"Asunto: {subject}")
        print(f"Mensaje: {message}")
        print("==========================")
        
        return True
        
    except Exception as e:
        print(f"Error enviando notificación: {str(e)}")
        return False
