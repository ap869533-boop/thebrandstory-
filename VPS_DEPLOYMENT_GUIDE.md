# 🚀 VPS Server Deployment Guide (thebrandsstory.)

Is guide ko follow karke aap is project ko kisi bhi Linux VPS (Hostinger, DigitalOcean, AWS EC2, Contabo, Linode) par 10-15 minute mein live kar sakte hain.

---

## 🏗️ Architecture Overview

- **Frontend**: React + Vite SPA (Compiled to `/var/www/thebrandsstory/frontend/dist`, directly served by high-speed Nginx web server)
- **Backend**: Node.js Express API Server running on port `8000` (Managed 24/7 by PM2 process manager)
- **Database**: MySQL Server running locally on port `3306`
- **Reverse Proxy & SSL**: Nginx forwards `/api/` to Express and serves frontend at `/`, with free Let's Encrypt SSL HTTPS.

---

## 📋 Step 1: VPS Server Setup & Packages Install

VPS mein SSH login karein:
```bash
ssh root@YOUR_VPS_IP
```

System update aur required packages install karein:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl nginx mysql-server certbot python3-certbot-nginx
```

Node.js 20 LTS install karein:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g pm2
```

Version verify karein:
```bash
node -v # Should be v20.x
npm -v
pm2 -v
```

---

## 🗄️ Step 2: MySQL Database Setup

1. MySQL terminal open karein:
```bash
sudo mysql
```

2. Database aur User create karein:
```sql
CREATE DATABASE IF NOT EXISTS brand_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'brandsuser'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON brand_db.* TO 'brandsuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. Database schema import karein:
```bash
mysql -u brandsuser -p brand_db < /var/www/thebrandsstory/backend/config/schema.sql
```

---

## 📁 Step 3: Project Clone & Setup

1. Project folder create karein:
```bash
mkdir -p /var/www
cd /var/www
git clone YOUR_GIT_REPO_URL thebrandsstory
cd /var/www/thebrandsstory
```
## ⚙️ Step 4: Backend Setup & PM2 Start

1. Backend dependencies install & build karein:
```bash
cd /var/www/thebrandsstory/backend
npm install
npm run build
```

2. PM2 se 24/7 background process start karein:
```bash
cd /var/www/thebrandsstory
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```
*(Screen par aayi `sudo env PATH...` command ko copy-paste karke run karein taaki server reboot par auto-start ho)*

Backend status check karein:
```bash
pm2 status
curl http://localhost:8000/health
# Output: {"status":"ok", ...}
```

---

## 🎨 Step 5: Frontend Build

1. Frontend folder mein jakar build karein:
```bash
cd /var/www/thebrandsstory/frontend
npm install
npm run build
```
Build files `/var/www/thebrandsstory/frontend/dist` mein generate ho jayengi.

---

## 🌐 Step 6: Nginx Reverse Proxy Setup

1. Nginx config create karein:
```bash
sudo nano /etc/nginx/sites-available/thebrandsstory
```

2. `nginx.conf.example` ka content paste karein (apna domain replace karein):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 50M;

    # Frontend Static Files
    root /var/www/thebrandsstory/frontend/dist;
    index index.html;

    # Backend Express API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Site enable karein & Nginx restart karein:
```bash
sudo ln -s /etc/nginx/sites-available/thebrandsstory /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Step 7: Free SSL (HTTPS) Enable

Certbot se automatic 1-click free SSL install karein:
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Prompt mein apna email dalein aur terms accept karein. Certbot automatically SSL install aur auto-renewal configure kar dega!

---

## 🔄 Updating Project in Future (CI/CD / Simple Pull)

Jab bhi aap code update karein, VPS par sirf ye 4 commands run karni hongi:
```bash
cd /var/www/thebrandsstory
git pull

# Update backend
cd backend && npm install && npm run build
pm2 restart thebrandsstory-backend

# Update frontend
cd ../frontend && npm install && npm run build
```
Sab kuch seamlessly update ho jayega! 🎉
