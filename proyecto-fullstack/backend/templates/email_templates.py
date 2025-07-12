# Templates de email para notificaciones
# Estos templates se pueden usar con Brevo (Sendinblue) u otro proveedor de email

def get_task_assigned_template(user_name, task_title, project_name):
    """Template para notificar cuando se asigna una tarea"""
    subject = f"Nueva tarea asignada: {task_title}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Nueva tarea asignada</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Nueva tarea asignada</h1>
            </div>
            <div class="content">
                <p>Hola {user_name},</p>
                <p>Se te ha asignado una nueva tarea en el proyecto <strong>{project_name}</strong>:</p>
                <h3>📋 {task_title}</h3>
                <p>Puedes revisar los detalles y comenzar a trabajar en ella accediendo a tu dashboard.</p>
                <a href="{{dashboard_url}}" class="button">Ver Dashboard</a>
                <p>¡Gracias por tu trabajo!</p>
            </div>
            <div class="footer">
                <p>© 2025 Nutrabiotics. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content

def get_project_update_template(user_name, project_name, update_message):
    """Template para notificar actualizaciones de proyecto"""
    subject = f"Proyecto actualizado: {project_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Proyecto actualizado</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f0fdf4; padding: 20px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Proyecto actualizado</h1>
            </div>
            <div class="content">
                <p>Hola {user_name},</p>
                <p>El proyecto <strong>{project_name}</strong> ha sido actualizado:</p>
                <div style="background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #10b981;">
                    {update_message}
                </div>
                <a href="{{project_url}}" class="button">Ver Proyecto</a>
                <p>Mantente al día con los cambios en tu proyecto.</p>
            </div>
            <div class="footer">
                <p>© 2025 Nutrabiotics. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content

def get_meeting_reminder_template(user_name, meeting_title, meeting_date, meeting_time):
    """Template para recordatorios de reuniones"""
    subject = f"Recordatorio: {meeting_title} - {meeting_date}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Recordatorio de reunión</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #fffbeb; padding: 20px; border-radius: 0 0 8px 8px; }}
            .meeting-details {{ background-color: white; padding: 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 16px 0; }}
            .button {{ display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📅 Recordatorio de reunión</h1>
            </div>
            <div class="content">
                <p>Hola {user_name},</p>
                <p>Te recordamos que tienes una reunión programada:</p>
                <div class="meeting-details">
                    <h3>🤝 {meeting_title}</h3>
                    <p><strong>📅 Fecha:</strong> {meeting_date}</p>
                    <p><strong>🕐 Hora:</strong> {meeting_time}</p>
                </div>
                <p>No olvides prepararte para la reunión y revisar la agenda previamente.</p>
                <a href="{{calendar_url}}" class="button">Ver Calendario</a>
            </div>
            <div class="footer">
                <p>© 2025 Nutrabiotics. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content

def get_welcome_template(user_name):
    """Template de bienvenida para nuevos usuarios"""
    subject = "¡Bienvenido a Nutrabiotics!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Bienvenido a Nutrabiotics</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #6366f1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
            .content {{ background-color: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }}
            .button {{ display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0; }}
            .features {{ background-color: white; padding: 16px; border-radius: 6px; margin: 16px 0; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #6b7280; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Bienvenido a Nutrabiotics!</h1>
            </div>
            <div class="content">
                <p>Hola {user_name},</p>
                <p>¡Nos complace darte la bienvenida a la plataforma de gestión de proyectos de Nutrabiotics!</p>
                
                <div class="features">
                    <h3>🚀 ¿Qué puedes hacer?</h3>
                    <ul>
                        <li>📋 Gestionar y organizar tus tareas</li>
                        <li>🤝 Colaborar en proyectos con tu equipo</li>
                        <li>📊 Hacer seguimiento del progreso</li>
                        <li>🔔 Recibir notificaciones importantes</li>
                    </ul>
                </div>
                
                <p>Comienza explorando tu dashboard y familiarízate con todas las funcionalidades disponibles.</p>
                <a href="{{dashboard_url}}" class="button">Acceder al Dashboard</a>
                
                <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
                <p>¡Esperamos que tengas una experiencia excelente!</p>
            </div>
            <div class="footer">
                <p>© 2025 Nutrabiotics. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return subject, html_content

# Función helper para obtener el template apropiado
def get_email_template(template_type, **kwargs):
    """
    Obtiene el template de email apropiado según el tipo
    
    Args:
        template_type (str): Tipo de template ('task_assigned', 'project_update', 'meeting_reminder', 'welcome')
        **kwargs: Argumentos específicos para cada template
    
    Returns:
        tuple: (subject, html_content)
    """
    templates = {
        'task_assigned': lambda: get_task_assigned_template(
            kwargs.get('user_name'),
            kwargs.get('task_title'),
            kwargs.get('project_name')
        ),
        'project_update': lambda: get_project_update_template(
            kwargs.get('user_name'),
            kwargs.get('project_name'),
            kwargs.get('update_message')
        ),
        'meeting_reminder': lambda: get_meeting_reminder_template(
            kwargs.get('user_name'),
            kwargs.get('meeting_title'),
            kwargs.get('meeting_date'),
            kwargs.get('meeting_time')
        ),
        'welcome': lambda: get_welcome_template(
            kwargs.get('user_name')
        )
    }
    
    if template_type in templates:
        return templates[template_type]()
    else:
        raise ValueError(f"Template type '{template_type}' not found")
