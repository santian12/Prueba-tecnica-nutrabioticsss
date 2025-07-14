import pytest
from unittest.mock import patch, MagicMock
from services.task_service import TaskService

class DummyTask:
    def __init__(self, status='todo', priority='high'):
        self.status = status
        self.priority = priority

@patch('services.task_service.Task')
def test_get_tasks_stats(mock_Task):
    mock_Task.query.all.return_value = [DummyTask('todo', 'high'), DummyTask('done', 'low')]
    metrics, err = TaskService.get_tasks_stats()
    assert err is None
    assert metrics['total_tasks'] == 2
    assert metrics['tasks_by_status']['todo'] == 1
    assert metrics['tasks_by_status']['done'] == 1

@patch('services.task_service.Task')
def test_get_all_tasks(mock_Task):
    mock_Task.query.all.return_value = [DummyTask('todo', 'high')]
    result, err = TaskService.get_all_tasks()
    assert err is None
    assert isinstance(result, list)
