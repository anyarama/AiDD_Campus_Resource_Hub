# Deployment Guide
## Campus Resource Hub

**Document Version:** 1.0  
**Last Updated:** November 14, 2024  
**Target Audience:** DevOps Engineers, System Administrators  

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Database Setup](#3-database-setup)
4. [Application Deployment](#4-application-deployment)
5. [Web Server Configuration](#5-web-server-configuration)
6. [SSL/TLS Setup](#6-ssltls-setup)
7. [External Services Configuration](#7-external-services-configuration)
8. [Monitoring & Logging](#8-monitoring--logging)
9. [Backup & Recovery](#9-backup--recovery)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### 1.1 System Requirements

**Minimum Hardware:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- Network: 100 Mbps

**Recommended Hardware (Production):**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 50 GB SSD
- Network: 1 Gbps

**Operating System:**
- Ubuntu 22.04 LTS (recommended)
- CentOS 8 / RHEL 8
- Debian 11+
- macOS 12+ (development only)

### 1.2 Software Dependencies

```bash
# Python
Python 3.10 or higher

# Web Servers
Nginx 1.18+ or Apache 2.4+

# WSGI Server
Gunicorn 21.2+ (recommended)
or uWSGI 2.0+

# Database (Production)
PostgreSQL 14+ (recommended)
or SQLite 3.38+ (development)

# Optional: Local LLM
Ollama 0.1.8+ or LM Studio 0.2+

# Optional: SSL Certificate
Let's Encrypt (certbot) or commercial certificate
```

---

## 2. Environment Setup

### 2.1 Create Deployment User

```bash
# Create dedicated user (recommended for security)
sudo useradd -m -s /bin/bash campushub
sudo passwd campushub

# Add to necessary groups
sudo usermod -aG www-data campushub

# Switch to deployment user
sudo su - campushub
```

### 2.2 Clone Repository

```bash
# Navigate to deployment directory
cd /opt

# Clone repository
sudo git clone https://github.com/your-org/aidd-capstone.git campus-resource-hub
sudo chown -R campushub:www-data campus-resource-hub
cd campus-resource-hub
```

### 2.3 Create Virtual Environment

```bash
# Install Python virtual environment
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip -y

# Create virtual environment
python3.10 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 2.4 Install Python Dependencies

```bash
# Install application dependencies
pip install -r requirements.txt

# Install production WSGI server
pip install gunicorn==21.2.0

# Optional: PostgreSQL adapter
pip install psycopg2-binary==2.9.9
```

### 2.5 Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit with production values
nano .env
```

**Production `.env` Template:**

```bash
# Flask Configuration
SECRET_KEY=<generate-strong-random-value>  # Use: python -c "import secrets; print(secrets.token_hex(32))"
FLASK_ENV=production
FLASK_DEBUG=0

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://campushub_user:password@localhost:5432/campushub_db

# Security Settings
SESSION_COOKIE_SECURE=True
WTF_CSRF_ENABLED=True

# Email Configuration (optional)
EMAIL_NOTIFICATIONS_ENABLED=True
MAIL_SERVER=smtp.iu.edu
MAIL_PORT=587
MAIL_USERNAME=noreply@iu.edu
MAIL_PASSWORD=<secure-password>
MAIL_DEFAULT_SENDER=Campus Resource Hub <noreply@iu.edu>
MAIL_USE_TLS=True

# Google OAuth (for calendar integration)
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
EXTERNAL_BASE_URL=https://yourdomain.com
GOOGLE_OAUTH_REDIRECT_PATH=/calendar/google/callback

# Local LLM (optional)
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama
LOCAL_LLM_MODEL=llama3.1:8b-instruct-q4_0
LOCAL_LLM_TIMEOUT=30

# Application Settings
ALLOWED_EMAIL_DOMAINS=iu.edu
TIMEZONE=America/Indiana/Indianapolis
```

**Generate Strong SECRET_KEY:**

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### 2.6 File Permissions

```bash
# Set secure permissions for .env
chmod 600 .env

# Set ownership
sudo chown campushub:www-data .env

# Set permissions for upload directory
mkdir -p src/static/uploads
chmod 755 src/static/uploads
chown -R campushub:www-data src/static/uploads
```

---

## 3. Database Setup

### 3.1 Option A: SQLite (Development/Small Deployments)

```bash
# Initialize database
python3 -c "from src.data_access import init_database; init_database()"

# Set secure permissions
chmod 600 campus_hub.db
chown campushub:www-data campus_hub.db

# Verify database
sqlite3 campus_hub.db "SELECT COUNT(*) FROM users;"
```

### 3.2 Option B: PostgreSQL (Production Recommended)

**Install PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib -y

# CentOS/RHEL
sudo dnf install postgresql-server postgresql-contrib -y
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Create Database and User:**

```bash
# Switch to postgres user
sudo su - postgres

# Create database and user
psql
```

```sql
CREATE DATABASE campushub_db;
CREATE USER campushub_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE campushub_db TO campushub_user;
\q
```

```bash
# Exit postgres user
exit
```

**Update `.env` with PostgreSQL connection:**

```bash
DATABASE_URL=postgresql://campushub_user:secure_password_here@localhost:5432/campushub_db
```

**Initialize Database Schema:**

```bash
# Activate virtual environment
source venv/bin/activate

# Initialize database
python3 -c "from src.data_access import init_database; init_database()"
```

**Verify Database:**

```bash
psql -U campushub_user -d campushub_db -c "SELECT COUNT(*) FROM users;"
```

### 3.3 Database Migrations

```bash
# Apply migrations (if database already exists)
sqlite3 campus_hub.db < docs/migrations/001_schema_upgrade.sql
sqlite3 campus_hub.db < docs/migrations/002_moderation_and_notes.sql
sqlite3 campus_hub.db < docs/migrations/003_add_cascade_constraints.sql

# For PostgreSQL
psql -U campushub_user -d campushub_db -f docs/migrations/001_schema_upgrade.sql
psql -U campushub_user -d campushub_db -f docs/migrations/002_moderation_and_notes.sql
psql -U campushub_user -d campushub_db -f docs/migrations/003_add_cascade_constraints.sql
```

---

## 4. Application Deployment

### 4.1 Gunicorn Configuration

**Create Gunicorn service file:**

```bash
sudo nano /etc/systemd/system/campushub.service
```

**Service configuration:**

```ini
[Unit]
Description=Campus Resource Hub WSGI Server
After=network.target

[Service]
Type=notify
User=campushub
Group=www-data
WorkingDirectory=/opt/campus-resource-hub
Environment="PATH=/opt/campus-resource-hub/venv/bin"
ExecStart=/opt/campus-resource-hub/venv/bin/gunicorn \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --worker-class sync \
    --timeout 60 \
    --access-logfile /var/log/campushub/access.log \
    --error-logfile /var/log/campushub/error.log \
    --log-level info \
    "src.app:create_app()"
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

**Create log directory:**

```bash
sudo mkdir -p /var/log/campushub
sudo chown campushub:www-data /var/log/campushub
sudo chmod 755 /var/log/campushub
```

**Enable and start service:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable campushub
sudo systemctl start campushub

# Check status
sudo systemctl status campushub

# View logs
sudo journalctl -u campushub -f
```

### 4.2 Worker Process Tuning

**Calculate optimal worker count:**

```bash
# Formula: (2 x CPU_CORES) + 1
# Example: 4-core CPU = (2 x 4) + 1 = 9 workers

# Check CPU cores
nproc

# Update workers in service file
--workers 9
```

**Worker Types:**

| Worker Class | Use Case | Pros | Cons |
|-------------|----------|------|------|
| `sync` | Default, CPU-bound tasks | Simple, stable | Blocks on I/O |
| `gevent` | I/O-bound tasks | Non-blocking I/O | Requires greenlet |
| `eventlet` | Async tasks | High concurrency | Complex debugging |

**Recommended for Campus Resource Hub:**
```bash
--worker-class sync
--workers 4  # Adjust based on CPU cores
```

### 4.3 Environment-Specific Configuration

**Development:**
```bash
FLASK_DEBUG=1
SESSION_COOKIE_SECURE=False
```

**Staging:**
```bash
FLASK_DEBUG=0
SESSION_COOKIE_SECURE=True
# Use staging database
```

**Production:**
```bash
FLASK_DEBUG=0
SESSION_COOKIE_SECURE=True
# Use production database
# Strong SECRET_KEY
```

---

## 5. Web Server Configuration

### 5.1 Nginx Configuration (Recommended)

**Install Nginx:**

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

**Create site configuration:**

```bash
sudo nano /etc/nginx/sites-available/campushub
```

**Nginx configuration:**

```nginx
# HTTP server (redirect to HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Certificate (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;
    
    # SSL Configuration (Modern, TLS 1.2+)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Logging
    access_log /var/log/nginx/campushub_access.log;
    error_log /var/log/nginx/campushub_error.log;
    
    # Static files
    location /static/ {
        alias /opt/campus-resource-hub/src/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Uploaded files
    location /static/uploads/ {
        alias /opt/campus-resource-hub/src/static/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
    
    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/campushub /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 5.2 Apache Configuration (Alternative)

**Install Apache:**

```bash
sudo apt install apache2 libapache2-mod-wsgi-py3 -y
sudo a2enmod proxy proxy_http ssl headers rewrite
```

**Create virtual host:**

```bash
sudo nano /etc/apache2/sites-available/campushub.conf
```

**Apache configuration:**

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # Redirect to HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Static files
    Alias /static /opt/campus-resource-hub/src/static
    <Directory /opt/campus-resource-hub/src/static>
        Require all granted
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </Directory>
    
    # Proxy to Gunicorn
    ProxyPreserveHost On
    ProxyPass /static !
    ProxyPass / http://127.0.0.1:8000/
    ProxyPassReverse / http://127.0.0.1:8000/
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/campushub_error.log
    CustomLog ${APACHE_LOG_DIR}/campushub_access.log combined
</VirtualHost>
```

**Enable site:**

```bash
sudo a2ensite campushub
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 6. SSL/TLS Setup

### 6.1 Let's Encrypt (Free, Automated)

**Install Certbot:**

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y

# CentOS/RHEL
sudo dnf install certbot python3-certbot-nginx -y
```

**Obtain Certificate:**

```bash
# For Nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For Apache
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose: Redirect HTTP to HTTPS (recommended)
```

**Auto-Renewal:**

```bash
# Test renewal
sudo certbot renew --dry-run

# Enable auto-renewal (cron job created automatically)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 6.2 Commercial Certificate

**Generate CSR:**

```bash
sudo openssl req -new -newkey rsa:2048 -nodes \
    -keyout /etc/ssl/private/yourdomain.key \
    -out /etc/ssl/certs/yourdomain.csr
```

**Install Certificate:**

1. Purchase certificate from CA (Digicert, Comodo, etc.)
2. Upload CSR to CA
3. Download certificate files
4. Copy to server:
   ```bash
   sudo cp yourdomain.crt /etc/ssl/certs/
   sudo cp ca-bundle.crt /etc/ssl/certs/
   sudo chmod 644 /etc/ssl/certs/yourdomain.crt
   sudo chmod 600 /etc/ssl/private/yourdomain.key
   ```
5. Update Nginx/Apache configuration with new paths

---

## 7. External Services Configuration

### 7.1 Google Calendar Integration

**1. Create OAuth 2.0 Credentials:**

- Visit https://console.cloud.google.com
- Create new project: "Campus Resource Hub"
- Enable Google Calendar API
- Create OAuth 2.0 Client ID (Web application)
- Add authorized redirect URIs:
  - `https://yourdomain.com/calendar/google/callback`
  - `http://localhost:5000/calendar/google/callback` (dev)

**2. Configure Application:**

```bash
# In .env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
EXTERNAL_BASE_URL=https://yourdomain.com
```

**3. OAuth Consent Screen:**

- Set application name: "Campus Resource Hub"
- Set authorized domains: `yourdomain.com`
- Add scopes: `https://www.googleapis.com/auth/calendar.events`
- Add test users (for testing mode)
- Publish app (for production)

### 7.2 Local LLM Setup (Ollama)

**Install Ollama:**

```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

**Pull Recommended Model:**

```bash
ollama pull llama3.1:8b-instruct-q4_0
```

**Create systemd service (auto-start):**

```bash
sudo nano /etc/systemd/system/ollama.service
```

```ini
[Unit]
Description=Ollama LLM Server
After=network.target

[Service]
Type=simple
User=campushub
ExecStart=/usr/local/bin/ollama serve
Restart=always
Environment="OLLAMA_HOST=127.0.0.1:11434"

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
```

**Configure Application:**

```bash
# In .env
LOCAL_LLM_BASE_URL=http://localhost:11434
LOCAL_LLM_PROVIDER=ollama
LOCAL_LLM_MODEL=llama3.1:8b-instruct-q4_0
```

### 7.3 Email Server Configuration

**Option A: Campus SMTP Server**

```bash
MAIL_SERVER=smtp.iu.edu
MAIL_PORT=587
MAIL_USERNAME=campushub@iu.edu
MAIL_PASSWORD=secure_password
MAIL_USE_TLS=True
EMAIL_NOTIFICATIONS_ENABLED=True
```

**Option B: Gmail SMTP (Development)**

```bash
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=yourapp@gmail.com
MAIL_PASSWORD=app_specific_password  # Not your regular password!
MAIL_USE_TLS=True
```

**Test Email Delivery:**

```python
from src.services.notification_center import NotificationCenter
from src.data_access.user_dal import UserDAL

# Get a test user
user = UserDAL.get_user_by_email('test@iu.edu')

# Send test notification
NotificationCenter.send_notification(
    user_id=user.user_id,
    notification_type='test',
    title='Test Notification',
    body='This is a test email from Campus Resource Hub'
)
```

---

## 8. Monitoring & Logging

### 8.1 Application Logs

**Gunicorn Logs:**

```bash
# Access logs
tail -f /var/log/campushub/access.log

# Error logs
tail -f /var/log/campushub/error.log

# Systemd logs
sudo journalctl -u campushub -f
```

**Log Rotation:**

```bash
sudo nano /etc/logrotate.d/campushub
```

```
/var/log/campushub/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 campushub www-data
    sharedscripts
    postrotate
        systemctl reload campushub > /dev/null 2>&1 || true
    endscript
}
```

### 8.2 Web Server Logs

**Nginx Logs:**

```bash
# Access logs
tail -f /var/log/nginx/campushub_access.log

# Error logs
tail -f /var/log/nginx/campushub_error.log
```

**Apache Logs:**

```bash
tail -f /var/log/apache2/campushub_access.log
tail -f /var/log/apache2/campushub_error.log
```

### 8.3 Database Monitoring

**PostgreSQL:**

```bash
# Check connections
psql -U campushub_user -d campushub_db -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Check database size
psql -U campushub_user -d campushub_db -c "SELECT pg_size_pretty(pg_database_size('campushub_db'));"

# Enable query logging (postgresql.conf)
log_min_duration_statement = 1000  # Log queries > 1 second
```

**SQLite:**

```bash
# Check database size
ls -lh campus_hub.db

# Analyze database
sqlite3 campus_hub.db "PRAGMA integrity_check;"
```

### 8.4 System Monitoring

**Install monitoring tools:**

```bash
sudo apt install htop iotop nethogs -y
```

**Monitor resources:**

```bash
# CPU and memory
htop

# Disk I/O
sudo iotop

# Network usage
sudo nethogs

# Disk usage
df -h
du -sh /opt/campus-resource-hub/*
```

**Optional: Install Prometheus + Grafana**

```bash
# Install Prometheus
sudo apt install prometheus -y

# Install Grafana
sudo apt-get install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
sudo apt-get update
sudo apt-get install grafana -y

# Enable and start
sudo systemctl enable prometheus grafana-server
sudo systemctl start prometheus grafana-server
```

---

## 9. Backup & Recovery

### 9.1 Database Backup

**Automated Backup Script:**

```bash
sudo nano /usr/local/bin/backup-campushub-db.sh
```

```bash
#!/bin/bash
# Campus Resource Hub Database Backup Script

BACKUP_DIR="/var/backups/campushub"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="campushub_db"
DB_USER="campushub_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/campushub_${DATE}.sql.gz

# SQLite backup (if using SQLite)
# sqlite3 /opt/campus-resource-hub/campus_hub.db ".backup $BACKUP_DIR/campushub_${DATE}.db"

# Delete backups older than 30 days
find $BACKUP_DIR -name "campushub_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/campushub_${DATE}.sql.gz"
```

```bash
sudo chmod +x /usr/local/bin/backup-campushub-db.sh
```

**Schedule Daily Backups:**

```bash
sudo crontab -e
```

```cron
# Daily database backup at 2 AM
0 2 * * * /usr/local/bin/backup-campushub-db.sh >> /var/log/campushub/backup.log 2>&1
```

### 9.2 File Backup

```bash
# Backup uploaded files
sudo rsync -avz /opt/campus-resource-hub/src/static/uploads/ \
    /var/backups/campushub/uploads/

# Backup .env file
sudo cp /opt/campus-resource-hub/.env /var/backups/campushub/env_backup_$(date +%Y%m%d)
```

### 9.3 Database Restore

**PostgreSQL:**

```bash
# Restore from backup
gunzip -c /var/backups/campushub/campushub_20241114_020000.sql.gz | \
    psql -U campushub_user -d campushub_db
```

**SQLite:**

```bash
# Restore from backup
cp /var/backups/campushub/campushub_20241114_020000.db /opt/campus-resource-hub/campus_hub.db
```

---

## 10. Troubleshooting

### 10.1 Application Won't Start

**Check service status:**

```bash
sudo systemctl status campushub
sudo journalctl -u campushub -n 50
```

**Common issues:**

1. **Port already in use:**
   ```bash
   sudo netstat -tulpn | grep 8000
   sudo kill <PID>
   ```

2. **Permission errors:**
   ```bash
   sudo chown -R campushub:www-data /opt/campus-resource-hub
   chmod 600 .env
   chmod 600 campus_hub.db
   ```

3. **Missing dependencies:**
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Database connection error:**
   ```bash
   # Check PostgreSQL is running
   sudo systemctl status postgresql
   
   # Test connection
   psql -U campushub_user -d campushub_db -c "SELECT 1;"
   ```

### 10.2 502 Bad Gateway (Nginx)

**Troubleshooting steps:**

1. **Check Gunicorn is running:**
   ```bash
   sudo systemctl status campushub
   ```

2. **Verify Gunicorn is listening:**
   ```bash
   sudo netstat -tulpn | grep 8000
   ```

3. **Check Nginx proxy configuration:**
   ```bash
   sudo nginx -t
   ```

4. **Review logs:**
   ```bash
   tail -f /var/log/nginx/campushub_error.log
   tail -f /var/log/campushub/error.log
   ```

### 10.3 Slow Performance

**Diagnostics:**

1. **Check system resources:**
   ```bash
   top
   htop
   df -h
   ```

2. **Check database performance:**
   ```bash
   # PostgreSQL: Check slow queries
   psql -U campushub_user -d campushub_db -c \
   "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
   ```

3. **Increase worker count:**
   ```bash
   # Edit /etc/systemd/system/campushub.service
   --workers 8  # Increase workers
   sudo systemctl daemon-reload
   sudo systemctl restart campushub
   ```

4. **Enable caching:**
   - Install Redis
   - Configure Flask-Caching

### 10.4 SSL/TLS Issues

**Certificate verification failed:**

```bash
# Check certificate
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew --force-renewal

# Check certificate expiry
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] System requirements met
- [ ] Python 3.10+ installed
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] `.env` configured with production values
- [ ] Database initialized
- [ ] Migrations applied

### Security

- [ ] Strong `SECRET_KEY` generated
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `FLASK_DEBUG=0`
- [ ] File permissions set correctly (`.env`: 600, database: 600)
- [ ] HTTPS/TLS configured
- [ ] Security headers enabled in Nginx/Apache
- [ ] Firewall configured (allow 80, 443)

### Services

- [ ] Gunicorn service created and enabled
- [ ] Nginx/Apache configured and running
- [ ] SSL certificate obtained and auto-renewal enabled
- [ ] Database service running
- [ ] Ollama service running (if using AI features)

### Monitoring

- [ ] Log rotation configured
- [ ] Backup script created and scheduled
- [ ] Monitoring tools installed
- [ ] Test notifications sent

### Testing

- [ ] Application accessible via HTTPS
- [ ] Login/registration works
- [ ] Resource creation works
- [ ] Booking flow works
- [ ] Google Calendar sync works (if configured)
- [ ] AI Concierge works (if configured)
- [ ] Email notifications work (if configured)

---

**Document Maintained By:** Campus Resource Hub DevOps Team  
**Last Updated:** November 14, 2024  
**Next Review:** May 2025

---

## Appendix: Quick Commands Reference

### Start/Stop Services

```bash
# Gunicorn
sudo systemctl start campushub
sudo systemctl stop campushub
sudo systemctl restart campushub
sudo systemctl status campushub

# Nginx
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl reload nginx

# PostgreSQL
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
```

### View Logs

```bash
# Application logs
sudo journalctl -u campushub -f
tail -f /var/log/campushub/error.log

# Web server logs
tail -f /var/log/nginx/campushub_error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

### Backup Commands

```bash
# Backup database
pg_dump -U campushub_user campushub_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip -c backup_20241114.sql.gz | psql -U campushub_user -d campushub_db

# Backup files
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz src/static/uploads/
```

---

**End of Deployment Guide**

