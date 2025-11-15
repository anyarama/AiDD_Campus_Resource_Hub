#!/bin/bash
# Script to install Flask-Login in the virtual environment

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Install Flask-Login
pip install Flask-Login==0.6.3

# Verify installation
echo "Verifying Flask-Login installation..."
python -c "import flask_login; print(f'Flask-Login version: {flask_login.__version__}')" 2>/dev/null && echo "✓ Flask-Login installed successfully!" || echo "✗ Installation failed"

# Show all Flask packages
echo ""
echo "Installed Flask packages:"
pip list | grep -i flask

