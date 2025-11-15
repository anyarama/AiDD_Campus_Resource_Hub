"""
Migration Script: Mark Existing Users as Email Verified
This script updates all existing users to have email_verified = 1
Run this once after adding email verification to avoid locking out existing users
"""
import sqlite3
import os

# Get database path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'campus_hub.db')

def migrate_existing_users():
    """Mark all existing users as email verified"""
    if not os.path.exists(DATABASE_PATH):
        print(f"Database not found at {DATABASE_PATH}")
        return

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    try:
        # Update all users who don't have email_verified set to 1
        cursor.execute('''
            UPDATE users
            SET email_verified = 1
            WHERE email_verified = 0 OR email_verified IS NULL
        ''')

        updated_count = cursor.rowcount
        conn.commit()

        print(f"✓ Successfully marked {updated_count} existing user(s) as email verified")

    except Exception as e:
        print(f"✗ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    print("Starting migration: Mark existing users as email verified")
    migrate_existing_users()
    print("Migration complete!")
