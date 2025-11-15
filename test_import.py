#!/usr/bin/env python3
"""Quick test to verify Flask-Login can be imported"""
import sys

print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path[:3]}...")

try:
    import flask_login
    print(f"✓ Flask-Login imported successfully!")
    print(f"  Version: {flask_login.__version__}")
    print(f"  Location: {flask_login.__file__}")
except ImportError as e:
    print(f"✗ Failed to import Flask-Login: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure virtual environment is activated:")
    print("   source venv/bin/activate")
    print("2. Verify Flask-Login is installed:")
    print("   pip list | grep -i flask")
    print("3. If not installed, run:")
    print("   pip install Flask-Login==0.6.3")
    sys.exit(1)

