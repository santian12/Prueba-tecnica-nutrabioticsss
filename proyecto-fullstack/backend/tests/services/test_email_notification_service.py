import pytest
from unittest.mock import patch, MagicMock
from services.email_notification_service import EmailNotificationService

@patch('services.email_notification_service.get_email_template')
def test_send_notification_disabled(mock_get_template):
    service = EmailNotificationService()
    service.enabled = False
    ok = service.send_notification('test@mail.com', 'welcome', {'user_name': 'Test'})
    assert ok is True

@patch('services.email_notification_service.get_email_template')
def test_send_notification_enabled_success(mock_get_template):
    service = EmailNotificationService()
    service.enabled = True
    mock_get_template.return_value = ("Subject", "<html>content</html>")
    ok = service.send_notification('test@mail.com', 'welcome', {'user_name': 'Test'})
    assert ok is True

@patch('services.email_notification_service.get_email_template')
def test_send_notification_error(mock_get_template):
    service = EmailNotificationService()
    service.enabled = True
    mock_get_template.side_effect = Exception('template error')
    ok = service.send_notification('test@mail.com', 'welcome', {'user_name': 'Test'})
    assert ok is False

def test_send_task_assigned_notification():
    service = EmailNotificationService()
    with patch.object(service, 'send_notification', return_value=True) as mock_send:
        ok = service.send_task_assigned_notification('a@b.com', 'User', 'Task', 'Project')
        assert ok is True
        mock_send.assert_called_once()

def test_send_project_update_notification():
    service = EmailNotificationService()
    with patch.object(service, 'send_notification', return_value=True) as mock_send:
        ok = service.send_project_update_notification('a@b.com', 'User', 'Project', 'Update')
        assert ok is True
        mock_send.assert_called_once()

def test_send_meeting_reminder_notification():
    service = EmailNotificationService()
    with patch.object(service, 'send_notification', return_value=True) as mock_send:
        ok = service.send_meeting_reminder_notification('a@b.com', 'User', 'Meeting', '2025-07-13', '10:00')
        assert ok is True
        mock_send.assert_called_once()

def test_send_welcome_notification():
    service = EmailNotificationService()
    with patch.object(service, 'send_notification', return_value=True) as mock_send:
        ok = service.send_welcome_notification('a@b.com', 'User')
        assert ok is True
        mock_send.assert_called_once()
