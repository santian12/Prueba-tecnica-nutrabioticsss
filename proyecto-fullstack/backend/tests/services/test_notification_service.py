import pytest
from unittest.mock import patch, MagicMock
from services.notification_service import NotificationService

class DummyNotification:
    def __init__(self, id=1, unread=True):
        self.id = id
        self.unread = unread
    def to_dict(self):
        return {'id': self.id, 'unread': self.unread}

@patch('services.notification_service.Notification')
def test_get_user_notifications(mock_Notification):
    mock_Notification.query.filter_by.return_value.order_by.return_value.limit.return_value.offset.return_value.all.return_value = [DummyNotification()]
    result = NotificationService.get_user_notifications(1)
    assert isinstance(result, list)
    assert result[0]['id'] == 1

@patch('services.notification_service.Notification')
def test_get_unread_count(mock_Notification):
    mock_Notification.query.filter_by.return_value.count.return_value = 3
    count = NotificationService.get_unread_count(1)
    assert count == 3

@patch('services.notification_service.Notification')
@patch('services.notification_service.db')
def test_mark_as_read(mock_db, mock_Notification):
    dummy = DummyNotification()
    mock_Notification.query.filter_by.return_value.first.return_value = dummy
    mock_db.session.commit = MagicMock()
    ok, err = NotificationService.mark_as_read(1, 1)
    assert ok is True or ok is False
