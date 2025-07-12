"""
Servicio de notificaciones por email
Preparado para integrar con Brevo (SendinBlue) u otros proveedores
"""

import os
import logging
from typing import Dict, Any, Optional
from templates.email_templates import get_email_template

logger = logging.getLogger(__name__)

class EmailNotificationService:
    """Servicio para envío de notificaciones por email"""
    
    def __init__(self):
        self.enabled = os.getenv('EMAIL_NOTIFICATIONS_ENABLED', 'false').lower() == 'true'
        self.brevo_api_key = os.getenv('BREVO_API_KEY')
        self.sender_email = os.getenv('SENDER_EMAIL', 'noreply@nutrabiotics.com')
        self.sender_name = os.getenv('SENDER_NAME', 'Nutrabiotics')
        
        if self.enabled and not self.brevo_api_key:
            logger.warning("Email notifications enabled but BREVO_API_KEY not configured")
    
    def send_notification(self, 
                         recipient_email: str, 
                         template_type: str, 
                         template_data: Dict[str, Any],
                         recipient_name: Optional[str] = None) -> bool:
        """
        Envía una notificación por email usando un template
        
        Args:
            recipient_email: Email del destinatario
            template_type: Tipo de template a usar
            template_data: Datos para el template
            recipient_name: Nombre del destinatario (opcional)
        
        Returns:
            bool: True si se envió correctamente, False en caso contrario
        """
        if not self.enabled:
            logger.info(f"Email notifications disabled. Would send {template_type} to {recipient_email}")
            return True
        
        try:
            # Obtener el template de email
            subject, html_content = get_email_template(template_type, **template_data)
            
            # Por ahora solo log, en el futuro se integrará con Brevo
            logger.info(f"📧 Email notification: {template_type}")
            logger.info(f"To: {recipient_email} ({recipient_name or 'Unknown'})")
            logger.info(f"Subject: {subject}")
            logger.debug(f"Content preview: {html_content[:200]}...")
            
            # TODO: Integrar con Brevo API
            # return self._send_via_brevo(recipient_email, recipient_name, subject, html_content)
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email notification: {str(e)}")
            return False
    
    def _send_via_brevo(self, 
                       recipient_email: str, 
                       recipient_name: Optional[str], 
                       subject: str, 
                       html_content: str) -> bool:
        """
        Envía email usando la API de Brevo
        Esta función se implementará cuando se configure Brevo
        """
        # TODO: Implementar integración con Brevo
        # import sib_api_v3_sdk
        # from sib_api_v3_sdk.rest import ApiException
        
        try:
            # Configuración de Brevo
            # configuration = sib_api_v3_sdk.Configuration()
            # configuration.api_key['api-key'] = self.brevo_api_key
            
            # api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
            
            # send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            #     to=[{"email": recipient_email, "name": recipient_name or "Usuario"}],
            #     sender={"email": self.sender_email, "name": self.sender_name},
            #     subject=subject,
            #     html_content=html_content
            # )
            
            # api_response = api_instance.send_transac_email(send_smtp_email)
            # logger.info(f"Email sent successfully via Brevo: {api_response}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error sending email via Brevo: {str(e)}")
            return False
    
    def send_task_assigned_notification(self, 
                                      user_email: str, 
                                      user_name: str, 
                                      task_title: str, 
                                      project_name: str) -> bool:
        """Envía notificación de tarea asignada"""
        return self.send_notification(
            recipient_email=user_email,
            recipient_name=user_name,
            template_type='task_assigned',
            template_data={
                'user_name': user_name,
                'task_title': task_title,
                'project_name': project_name
            }
        )
    
    def send_project_update_notification(self, 
                                       user_email: str, 
                                       user_name: str, 
                                       project_name: str, 
                                       update_message: str) -> bool:
        """Envía notificación de actualización de proyecto"""
        return self.send_notification(
            recipient_email=user_email,
            recipient_name=user_name,
            template_type='project_update',
            template_data={
                'user_name': user_name,
                'project_name': project_name,
                'update_message': update_message
            }
        )
    
    def send_meeting_reminder_notification(self, 
                                         user_email: str, 
                                         user_name: str, 
                                         meeting_title: str, 
                                         meeting_date: str, 
                                         meeting_time: str) -> bool:
        """Envía recordatorio de reunión"""
        return self.send_notification(
            recipient_email=user_email,
            recipient_name=user_name,
            template_type='meeting_reminder',
            template_data={
                'user_name': user_name,
                'meeting_title': meeting_title,
                'meeting_date': meeting_date,
                'meeting_time': meeting_time
            }
        )
    
    def send_welcome_notification(self, 
                                user_email: str, 
                                user_name: str) -> bool:
        """Envía notificación de bienvenida"""
        return self.send_notification(
            recipient_email=user_email,
            recipient_name=user_name,
            template_type='welcome',
            template_data={
                'user_name': user_name
            }
        )

# Instancia global del servicio
email_service = EmailNotificationService()

# Funciones de conveniencia
def send_task_assigned_email(user_email: str, user_name: str, task_title: str, project_name: str):
    """Helper function para enviar notificación de tarea asignada"""
    return email_service.send_task_assigned_notification(user_email, user_name, task_title, project_name)

def send_project_update_email(user_email: str, user_name: str, project_name: str, update_message: str):
    """Helper function para enviar notificación de actualización de proyecto"""
    return email_service.send_project_update_notification(user_email, user_name, project_name, update_message)

def send_meeting_reminder_email(user_email: str, user_name: str, meeting_title: str, meeting_date: str, meeting_time: str):
    """Helper function para enviar recordatorio de reunión"""
    return email_service.send_meeting_reminder_notification(user_email, user_name, meeting_title, meeting_date, meeting_time)

def send_welcome_email(user_email: str, user_name: str):
    """Helper function para enviar notificación de bienvenida"""
    return email_service.send_welcome_notification(user_email, user_name)
