import pytest
from unittest.mock import patch, MagicMock
from services.project_service import ProjectService
from models.project import Project

class DummyProject:
    def __init__(self, id=1, name='Test', description='Desc', created_by=1):
        self.id = id
        self.name = name
        self.description = description
        self.created_by = created_by
    def to_dict(self, include_tasks=False):
        return {'id': self.id, 'name': self.name, 'description': self.description, 'created_by': self.created_by}

@patch('services.project_service.Project')
@patch('services.project_service.db')
def test_get_all_projects(mock_db, mock_Project):
    mock_Project.query.all.return_value = [DummyProject()]
    result, err = ProjectService.get_all_projects()
    assert err is None
    assert isinstance(result, list)
    assert result[0]['name'] == 'Test'

@patch('services.project_service.Project')
def test_get_project_by_id(mock_Project):
    mock_Project.query.get.return_value = DummyProject()
    result, err = ProjectService.get_project_by_id(1)
    assert err is None
    assert result['id'] == 1

@patch('services.project_service.db')
def test_create_project_success(mock_db):
    with patch('services.project_service.Project', DummyProject):
        mock_db.session.add = MagicMock()
        mock_db.session.commit = MagicMock()
        result, err = ProjectService.create_project('Test', 'Desc', 1)
        assert err is None
        assert result['name'] == 'Test'

@patch('services.project_service.Project')
@patch('services.project_service.db')
def test_create_project_error(mock_db, mock_Project):
    mock_db.session.add.side_effect = Exception('DB error')
    mock_db.session.rollback = MagicMock()
    result, err = ProjectService.create_project('Test', 'Desc', 1)
    assert result is None
    assert 'Error' in err
