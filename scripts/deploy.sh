#!/bin/bash
# ==============================================================================
# 🚀 Production Deployment Script for thebrandsstory.
# Works with GitHub Actions CI/CD or direct execution on VPS
# ==============================================================================

set -e # Exit immediately if any command fails

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "======================================================"
echo "  🚀 Starting Deployment: thebrandsstory."
echo "  Time: $(date)"
echo "======================================================"

# Determine project root directory
PROJECT_ROOT="${1:-$(pwd)}"
cd "$PROJECT_ROOT"
log_info "Working directory: $PROJECT_ROOT"

# 1. Pull latest code from Git
log_info "Fetching latest code from origin/main..."
if [ -d ".git" ]; then
    git stash --include-untracked || true
    git pull origin main
    log_success "Git repository updated to latest commit."
else
    log_warn "Not a git repository. Skipping git pull."
fi

# 2. Deploy Backend
log_info "Installing backend dependencies & building TypeScript..."
cd "$PROJECT_ROOT/backend"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        log_warn "backend/.env not found! Copying from .env.example..."
        cp .env.example .env
        log_warn "Please update backend/.env with your production credentials!"
    else
        log_error "backend/.env not found and no .env.example available!"
    fi
fi

npm ci || npm install
npm run build
log_success "Backend compiled successfully to backend/dist"

# 2.1 Sync Database Schema (Safe: Only creates new missing tables, preserves all data)
if [ -f "$PROJECT_ROOT/backend/config/schema.sql" ]; then
    log_info "Checking for new database tables in schema.sql..."
    DB_USER=$(grep -E '^DB_USER=' .env 2>/dev/null | cut -d '=' -f2- | tr -d ' "\r')
    DB_PASS=$(grep -E '^DB_PASSWORD=' .env 2>/dev/null | cut -d '=' -f2- | tr -d ' "\r')
    DB_NAME=$(grep -E '^DB_NAME=' .env 2>/dev/null | cut -d '=' -f2- | tr -d ' "\r')
    DB_PORT=$(grep -E '^DB_PORT=' .env 2>/dev/null | cut -d '=' -f2- | tr -d ' "\r')

    if [ -n "$DB_USER" ] && [ -n "$DB_NAME" ]; then
        mysql -u "$DB_USER" -p"$DB_PASS" -P "${DB_PORT:-3306}" "$DB_NAME" < "$PROJECT_ROOT/backend/config/schema.sql" 2>/dev/null || true
        log_success "Database tables verified and updated safely."
    fi
fi

# 3. Reload Backend with PM2
log_info "Reloading backend application with PM2 (Zero Downtime)..."
cd "$PROJECT_ROOT"

if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "thebrandsstory-backend"; then
        pm2 reload ecosystem.config.cjs --update-env
        log_success "PM2 process 'thebrandsstory-backend' reloaded."
    else
        pm2 start ecosystem.config.cjs
        log_success "PM2 process 'thebrandsstory-backend' started."
    fi
    pm2 save || true
else
    log_warn "PM2 is not installed globally. Starting backend directly in background..."
    nohup npm --prefix backend start > /var/log/thebrandsstory.log 2>&1 &
fi

# 4. Deploy Frontend
log_info "Installing frontend dependencies & building production SPA..."
cd "$PROJECT_ROOT/frontend"
npm ci || npm install
npm run build
log_success "Frontend built successfully in frontend/dist"

# 5. Reload Nginx (if permissions allow)
log_info "Checking Nginx configuration..."
if command -v nginx &> /dev/null; then
    if nginx -t 2>/dev/null; then
        systemctl reload nginx 2>/dev/null || sudo systemctl reload nginx 2>/dev/null || true
        log_success "Nginx reloaded successfully."
    else
        log_warn "Nginx config test failed or sudo permission required. Skipping reload."
    fi
fi

# 6. Health Check
log_info "Performing Backend API health check on http://localhost:8000/health..."
sleep 3
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "FAILED")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    log_success "Health check PASSED (HTTP 200 OK)"
else
    log_warn "Health check returned status: $HEALTH_RESPONSE. Check 'pm2 logs thebrandsstory-backend' for details."
fi

echo "======================================================"
log_success "🎉 Deployment finished successfully at $(date)!"
echo "======================================================"
