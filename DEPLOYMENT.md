# Deployment Guide

This guide covers deployment options for the Photo Book Marketing app.

## Prerequisites

- Node.js 18+ installed
- Git repository cloned
- Environment variables configured

## Environment Variables

### Server (.env in server/)

```bash
ADMIN_PASSWORD=your-secure-password
PORT=3000
NODE_ENV=production
```

### Client (.env in client/)

```bash
# For production, set to your API URL
VITE_API_BASE_URL=https://your-api-domain.com
```

---

## Option 1: Vercel (Recommended)

Best for: Quick deployment with automatic scaling

### Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add `ADMIN_PASSWORD`
   - Add `VITE_API_BASE_URL` (your Vercel domain)

5. Deploy to production:
   ```bash
   vercel --prod
   ```

### Vercel Configuration

The included `vercel.json` handles:
- Static frontend serving
- Serverless API functions
- Automatic HTTPS
- CDN caching

---

## Option 2: Single Server (VPS/Cloud)

Best for: Full control, custom infrastructure

### Requirements

- Ubuntu 20.04+ (or similar)
- Node.js 18+
- Nginx (for reverse proxy)
- PM2 (for process management)

### Steps

1. **Clone and build**
   ```bash
   git clone https://github.com/jaharoni/photo-book-marketing.git
   cd photo-book-marketing
   npm run install:all
   npm run build
   ```

2. **Configure environment**
   ```bash
   cd server
   cp .env.example .env
   nano .env  # Edit with your values
   ```

3. **Install PM2**
   ```bash
   npm install -g pm2
   ```

4. **Start server with PM2**
   ```bash
   cd server
   pm2 start dist/index.js --name photo-book-api
   pm2 save
   pm2 startup  # Follow instructions to enable on boot
   ```

5. **Configure Nginx**
   Create `/etc/nginx/sites-available/photo-book`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /path/to/photo-book-marketing/client/dist;
           try_files $uri $uri/ /index.html;
       }

       # API proxy
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/photo-book /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 3: Docker

Best for: Containerized deployment, consistency across environments

### Dockerfile (Root)

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source
COPY . .

# Build
RUN cd client && npm run build
RUN cd server && npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/content ./content
COPY --from=builder /app/data ./data

WORKDIR /app/server

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Build and Run

```bash
# Build image
docker build -t photo-book-marketing .

# Run container
docker run -d \
  -p 3000:3000 \
  -e ADMIN_PASSWORD=your-password \
  -e NODE_ENV=production \
  -v $(pwd)/content:/app/content \
  -v $(pwd)/data:/app/data \
  --name photo-book \
  photo-book-marketing
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - NODE_ENV=production
    volumes:
      - ./content:/app/content
      - ./data:/app/data
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## Option 4: Heroku

Best for: Simple deployment with free tier

### Setup

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Set buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Configure environment**
   ```bash
   heroku config:set ADMIN_PASSWORD=your-password
   heroku config:set NODE_ENV=production
   ```

5. **Add Procfile**
   Create `Procfile` in root:
   ```
   web: cd server && npm start
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Admin password works
- [ ] Lead capture form submits successfully
- [ ] Book content loads and animates
- [ ] Mobile responsive design works
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Content JSON files backed up
- [ ] Error monitoring configured

---

## Monitoring

### Check Application Health

```bash
curl https://your-domain.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2025-12-01T..."}
```

### View Logs (PM2)

```bash
pm2 logs photo-book-api
pm2 monit
```

### View Logs (Docker)

```bash
docker logs photo-book
docker logs -f photo-book  # Follow mode
```

---

## Backup

### Important Files to Backup

- `content/book.json` - Book spreads
- `content/settings.json` - Site settings
- `data/leads.json` - Lead submissions
- `server/.env` - Environment configuration

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

mkdir -p $BACKUP_DIR
cp content/*.json $BACKUP_DIR/
cp data/*.json $BACKUP_DIR/
cp server/.env $BACKUP_DIR/

echo "Backup created: $BACKUP_DIR"
```

Schedule with cron:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Troubleshooting

### API Not Responding

1. Check if server is running:
   ```bash
   pm2 status
   # or
   docker ps
   ```

2. Check logs for errors

3. Verify port 3000 is not blocked

### Frontend Not Loading

1. Verify build completed:
   ```bash
   ls client/dist/
   ```

2. Check Nginx configuration

3. Verify VITE_API_BASE_URL is correct

### Admin Panel Issues

1. Verify ADMIN_PASSWORD environment variable

2. Clear browser localStorage:
   ```javascript
   localStorage.clear()
   ```

3. Check browser console for errors

---

## Scaling

### Database Migration

When ready to move from JSON files to a database:

1. Choose database (PostgreSQL, MongoDB, etc.)
2. Create migration script to import JSON data
3. Update server API endpoints to use database
4. Test thoroughly before switching

### CDN for Images

For better performance:

1. Upload book images to CDN (Cloudflare, AWS CloudFront)
2. Update `imageUrl` fields in `content/book.json`
3. Enable image optimization and caching

### Load Balancing

For high traffic:

1. Deploy multiple server instances
2. Use load balancer (Nginx, AWS ALB)
3. Share session state (Redis)
4. Use shared storage for JSON files

---

## Security

### Recommended Settings

- Use strong admin password (20+ characters)
- Enable HTTPS only
- Set proper CORS policies
- Rate limit API endpoints
- Regular security updates
- Monitor access logs

### Helmet.js (Enhanced Security)

Add to server:
```bash
cd server
npm install helmet
```

In `server/src/index.ts`:
```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Open GitHub issue with:
   - Deployment method
   - Error messages
   - Environment details
