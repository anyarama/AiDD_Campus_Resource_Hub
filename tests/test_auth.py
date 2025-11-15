import bcrypt
import sqlite3
import pytest

from src.data_access.user_dal import UserDAL


def test_create_user_hashes_password(temp_db):
    """Ensure passwords are stored as salted bcrypt hashes."""
    plaintext = 'SecurePass1'
    user = UserDAL.create_user(
        name='Alice Tester',
        email='alice@iu.edu',
        password=plaintext,
        role='student',
        department='Engineering'
    )

    assert user.password_hash != plaintext
    assert bcrypt.checkpw(plaintext.encode('utf-8'), user.password_hash.encode('utf-8'))


def test_duplicate_email_rejected(temp_db):
    """Creating a user with an existing email should raise an exception."""
    UserDAL.create_user(
        name='Existing User',
        email='exists@iu.edu',
        password='AnotherPass1',
        role='student',
        department='Business'
    )

    with pytest.raises(sqlite3.IntegrityError):
        UserDAL.create_user(
            name='Duplicate User',
            email='exists@iu.edu',
            password='AnotherPass1',
            role='student',
            department='Business'
        )
