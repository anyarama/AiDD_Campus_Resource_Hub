# PowerShell script to set up Local LLM environment variables
# Run this script to configure your Ollama connection

Write-Host "Setting up Local LLM environment variables..." -ForegroundColor Green

# Set environment variables for current session
$env:LOCAL_LLM_BASE_URL = "http://localhost:11434"
$env:LOCAL_LLM_PROVIDER = "ollama"
$env:LOCAL_LLM_MODEL = "llama3.1"
$env:LOCAL_LLM_TIMEOUT = "30"

Write-Host "Environment variables set for current session:" -ForegroundColor Yellow
Write-Host "  LOCAL_LLM_BASE_URL = $env:LOCAL_LLM_BASE_URL"
Write-Host "  LOCAL_LLM_PROVIDER = $env:LOCAL_LLM_PROVIDER"
Write-Host "  LOCAL_LLM_MODEL = $env:LOCAL_LLM_MODEL"
Write-Host ""

# Create .env file
$envContent = @"
# Local LLM Configuration (Ollama)
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama
LOCAL_LLM_MODEL=llama3.1
LOCAL_LLM_TIMEOUT=30
"@

$envPath = Join-Path $PSScriptRoot ".env"
if (Test-Path $envPath) {
    Write-Host "Warning: .env file already exists. Backing up to .env.backup" -ForegroundColor Yellow
    Copy-Item $envPath "$envPath.backup"
}

$envContent | Out-File -FilePath $envPath -Encoding utf8
Write-Host ".env file created at: $envPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your Flask application" -ForegroundColor White
Write-Host "2. Test the connection by running: python test_llm_connection.py" -ForegroundColor White
Write-Host "3. Visit http://localhost:5000/concierge to use the AI concierge" -ForegroundColor White

