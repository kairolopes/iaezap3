#!/bin/bash

# 🚀 IAEZAP - VPS Deployment Script
# Script de deployment automático para Hostinger VPS
# Uso: bash deploy-vps.sh

set -e  # Exit on error

echo "================================"
echo "🚀 IAEZAP - VPS Deployment"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configurações
VPS_USER="root"
DOMAIN_MAIN="iaezap.com.br"
DOMAIN_REDIRECT="iaezap.com"
APP_PATH="/home/iaezap"
REPO_URL="https://github.com/kairolopes/iaezap3.git"
EMAIL="kairolopes@gmail.com"

echo -e "${YELLOW}📋 Configurações:${NC}"
echo "Domain Principal: $DOMAIN_MAIN"
echo "Domain Redirect: $DOMAIN_REDIRECT"
echo "App Path: $APP_PATH"
echo "Email: $EMAIL"
echo ""

# Step 1: Atualizar sistema
echo -e "${YELLOW}1️⃣ Atualizando sistema...${NC}"
apt-get update -y
apt-get upgrade -y

# Step 2: Instalar Node.js
echo -e "${YELLOW}2️⃣ Instalando Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

echo -e "${GREEN}✅ Node.js instalado: $(node --version)${NC}"

# Step 3: Instalar PM2
echo -e "${YELLOW}3️⃣ Instalando PM2...${NC}"
npm install -g pm2
pm2 startup
pm2 save

echo -e "${GREEN}✅ PM2 instalado${NC}"

# Step 4: Instalar Nginx
echo -e "${YELLOW}4️⃣ Instalando Nginx...${NC}"
apt-get install -y nginx

systemctl enable nginx
systemctl start nginx

echo -e "${GREEN}✅ Nginx instalado${NC}"

# Step 5: Instalar Git
echo -e "${YELLOW}5️⃣ Instalando Git...${NC}"
apt-get install -y git

# Step 6: Clonar repositório
echo -e "${YELLOW}6️⃣ Clonando repositório...${NC}"
if [ -d "$APP_PATH" ]; then
  echo "Pasta existe, fazendo pull..."
  cd "$APP_PATH"
  git pull origin main
else
  echo "Clonando repositório..."
  git clone "$REPO_URL" "$APP_PATH"
  cd "$APP_PATH"
fi

echo -e "${GREEN}✅ Repositório clonado/atualizado${NC}"

# Step 7: Instalar dependências Backend
echo -e "${YELLOW}7️⃣ Instalando dependências do Backend...${NC}"
cd "$APP_PATH/backend"
npm install

echo -e "${GREEN}✅ Backend configurado${NC}"

# Step 8: Instalar dependências Frontend
echo -e "${YELLOW}8️⃣ Instalando dependências do Frontend...${NC}"
cd "$APP_PATH/frontend"
npm install
npm run build

echo -e "${GREEN}✅ Frontend compilado${NC}"

# Step 9: Configurar .env Backend
echo -e "${YELLOW}9️⃣ Configurando .env...${NC}"
cat > "$APP_PATH/backend/.env" << 'EOF'
# SUPABASE
SUPABASE_URL="https://gqromcfhiosfppqlottz.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcm9tY2ZoaW9zZnBwcWxvdHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwNDM5NjYsImV4cCI6MjA5ODYxOTk2Nn0.S900nakArfVnf9aTOVWemJblh--et9rhs1en7x2e05E"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdxcm9tY2ZoaW9zZnBwcWxvdHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzA0Mzk2NiwiZXhwIjoyMDk4NjE5OTY2fQ.DBhYDB4jXnrOjgcihpUwpR5Xd0Nn5gb6KYnrDUzEFcc"

# Z-API WhatsApp
Z_API_INSTANCE_ID="3ECD22ED86FE925D5A7772442EF70706"
Z_API_TOKEN="9D350B8542F495AC919995C1"
Z_API_CLIENT_TOKEN="Ff94d05bcd8b546afb957fc52d8e33ebaS"
APP_BASE_URL="https://iaezap.com.br"

# App
NODE_ENV="production"
PORT=3000
EOF

echo -e "${GREEN}✅ .env configurado${NC}"

# Step 10: Iniciar Backend com PM2
echo -e "${YELLOW}🔟 Iniciando Backend com PM2...${NC}"
cd "$APP_PATH/backend"
pm2 delete "iaezap-backend" 2>/dev/null || true
pm2 start "npm run start:prod" --name "iaezap-backend" --namespace "iaezap"
pm2 save

echo -e "${GREEN}✅ Backend rodando${NC}"

# Step 11: Configurar Nginx - .com.br (principal)
echo -e "${YELLOW}1️⃣1️⃣ Configurando Nginx para $DOMAIN_MAIN...${NC}"
cat > "/etc/nginx/sites-available/$DOMAIN_MAIN" << 'EOF'
server {
    listen 80;
    server_name iaezap.com.br www.iaezap.com.br;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN_MAIN /etc/nginx/sites-enabled/$DOMAIN_MAIN 2>/dev/null || true

# Step 12: Configurar Nginx - .com (redirect)
echo -e "${YELLOW}1️⃣2️⃣ Configurando redirect de $DOMAIN_REDIRECT...${NC}"
cat > "/etc/nginx/sites-available/$DOMAIN_REDIRECT" << 'EOF'
server {
    listen 80;
    server_name iaezap.com www.iaezap.com;

    # Redirect para .com.br
    return 301 https://iaezap.com.br$request_uri;
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN_REDIRECT /etc/nginx/sites-enabled/$DOMAIN_REDIRECT 2>/dev/null || true

# Step 13: Testar Nginx
echo -e "${YELLOW}1️⃣3️⃣ Testando Nginx...${NC}"
nginx -t

# Step 14: Reiniciar Nginx
echo -e "${YELLOW}1️⃣4️⃣ Reiniciando Nginx...${NC}"
systemctl restart nginx

echo -e "${GREEN}✅ Nginx configurado${NC}"

# Step 15: Instalar Certbot para SSL
echo -e "${YELLOW}1️⃣5️⃣ Instalando Certbot para SSL...${NC}"
apt-get install -y certbot python3-certbot-nginx

echo -e "${YELLOW}Configurando SSL...${NC}"
certbot certonly --nginx \
  -d $DOMAIN_MAIN \
  -d www.$DOMAIN_MAIN \
  -d $DOMAIN_REDIRECT \
  -d www.$DOMAIN_REDIRECT \
  --non-interactive \
  --agree-tos \
  --email $EMAIL

# Step 16: Atualizar Nginx config com SSL
cat > "/etc/nginx/sites-available/$DOMAIN_MAIN" << 'EOF'
server {
    listen 443 ssl http2;
    server_name iaezap.com.br www.iaezap.com.br;

    ssl_certificate /etc/letsencrypt/live/iaezap.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iaezap.com.br/privkey.pem;

    # Frontend (React)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Redirect HTTP -> HTTPS
server {
    listen 80;
    server_name iaezap.com.br www.iaezap.com.br;
    return 301 https://$server_name$request_uri;
}
EOF

# Redirect de .com para .com.br (com SSL)
cat > "/etc/nginx/sites-available/$DOMAIN_REDIRECT" << 'EOF'
server {
    listen 443 ssl http2;
    server_name iaezap.com www.iaezap.com;

    ssl_certificate /etc/letsencrypt/live/iaezap.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/iaezap.com.br/privkey.pem;

    return 301 https://iaezap.com.br$request_uri;
}

server {
    listen 80;
    server_name iaezap.com www.iaezap.com;
    return 301 https://iaezap.com.br$request_uri;
}
EOF

systemctl restart nginx

echo -e "${GREEN}✅ SSL configurado${NC}"

# Final
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ DEPLOYMENT CONCLUÍDO!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}📊 Status:${NC}"
echo -e "Frontend:  ${GREEN}https://iaezap.com.br${NC}"
echo -e "API:       ${GREEN}https://iaezap.com.br/api${NC}"
echo -e "Redirect:  ${GREEN}iaezap.com → iaezap.com.br${NC}"
echo ""
echo -e "${YELLOW}📝 Próximas ações:${NC}"
echo "1. Registrar webhook no Z-API: https://iaezap.com.br/api/whatsapp/webhook"
echo "2. Fazer deploy do frontend no Netlify"
echo "3. Testar: https://iaezap.com.br"
echo ""
echo -e "${YELLOW}🔧 Comandos úteis:${NC}"
echo "pm2 logs iaezap-backend      # Ver logs"
echo "pm2 restart iaezap-backend   # Reiniciar"
echo "pm2 stop iaezap-backend      # Parar"
echo ""
