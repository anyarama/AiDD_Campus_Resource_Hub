"""
Quick setup script for Campus Resource Hub
Run this after creating the virtual environment and installing requirements
"""

import os
import sys

def setup_project():
    print("🚀 Setting up Campus Resource Hub...")
    
    # Check Python version
    if sys.version_info < (3, 10):
        print("❌ Error: Python 3.10 or higher is required")
        sys.exit(1)
    print("✓ Python version OK")
    
    # Create necessary directories
    directories = [
        'src/static/uploads',
        'docs/context/APA',
        'docs/context/DT',
        'docs/context/PM',
        'docs/context/shared',
        'tests/ai_eval',
        '.prompt'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Created directory: {directory}")
    
    # Initialize database
    print("\n📊 Initializing database...")
    from src.data_access import init_database
    init_database()
    print("✓ Database initialized")
    
    # Create first admin user
    print("\n👤 Creating admin user...")
    from src.data_access.user_dal import UserDAL
    try:
        admin = UserDAL.create_user(
            name="Admin User",
            email="admin@campus.edu",
            password="Admin123!",
            role="admin",
            department="Administration"
        )
        print(f"✓ Admin user created: admin@campus.edu / Admin123!")
    except Exception as e:
        print(f"ℹ️  Admin user may already exist: {e}")
    
    print("\n✅ Setup complete!")
    print("\n🎉 You can now run the application with: python src/app.py")
    print("📝 Login with: admin@campus.edu / Admin123!")

if __name__ == "__main__":
    setup_project()