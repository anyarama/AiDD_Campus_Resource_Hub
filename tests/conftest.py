import os

import pytest

from src.app import create_app
from src.config import Config
from src.data_access import init_database


@pytest.fixture(autouse=True)
def temp_db(tmp_path, monkeypatch):
    """Provide an isolated SQLite database for each test."""
    db_path = tmp_path / 'test.db'
    monkeypatch.setattr(Config, 'DATABASE_PATH', str(db_path))
    monkeypatch.setattr(Config, 'EMAIL_VERIFICATION_ENABLED', False)

    # Ensure upload folder exists for operations that rely on it
    upload_dir = tmp_path / 'uploads'
    upload_dir.mkdir(exist_ok=True)
    monkeypatch.setattr(Config, 'UPLOAD_FOLDER', str(upload_dir))

    init_database()
    yield

    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def app(temp_db):
    app = create_app()
    app.config.update(
        TESTING=True,
        WTF_CSRF_ENABLED=False,
        SERVER_NAME='localhost'
    )
    return app


@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client
