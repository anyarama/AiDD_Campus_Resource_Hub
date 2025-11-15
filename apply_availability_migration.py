#!/usr/bin/env python3
"""
Apply availability schedule migration to the database.
Run this script once to add the new availability fields.
"""
import sqlite3
import os

# Get the database path from environment or use default
DB_PATH = os.getenv('DATABASE_PATH', 'campus_hub.db')
MIGRATION_FILE = 'migrations/add_availability_fields.sql'

def apply_migration():
    """Apply the availability fields migration"""
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        print(f"   Please check your DATABASE_PATH environment variable")
        return False

    try:
        # Read migration SQL
        with open(MIGRATION_FILE, 'r') as f:
            migration_sql = f.read()

        # Connect and execute
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Check if migration already applied
        cursor.execute("PRAGMA table_info(resources)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'availability_schedule' in columns:
            print("ℹ️  Migration already applied - availability fields exist")
            conn.close()
            return True

        # Split and execute each statement
        statements = [s.strip() for s in migration_sql.split(';') if s.strip() and not s.strip().startswith('--')]

        for statement in statements:
            if statement:
                cursor.execute(statement)

        conn.commit()
        conn.close()

        print("✅ Migration applied successfully!")
        print("   Added availability schedule fields to resources table")
        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == '__main__':
    apply_migration()
