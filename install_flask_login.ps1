# PowerShell script to install Flask-Login in the virtual environment

# Navigate to project directory
$projectPath = "\\wsl.localhost\Ubuntu\home\aashish\code\capstone"
Set-Location $projectPath

# Activate virtual environment
& "$projectPath\venv\Scripts\Activate.ps1"

# Install Flask-Login
pip install Flask-Login==0.6.3

# Verify installation
Write-Host "Verifying Flask-Login installation..."
python -c "import flask_login; print(f'Flask-Login version: {flask_login.__version__}')" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Flask-Login installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Installation failed" -ForegroundColor Red
}

# Show all Flask packages
Write-Host ""
Write-Host "Installed Flask packages:"
pip list | Select-String -Pattern "flask"

