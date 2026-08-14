# Deployment Guide - Student Management System

## Overview
This guide covers various deployment options for the Student Management System.

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployment](#cloud-deployment)

---

## Local Development

### Prerequisites
- Node.js v16+
- MongoDB (optional - uses in-memory DB by default)
- npm or yarn

### Setup

1. **Clone/Extract the project**
   ```bash
   cd "student management systyem"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on: `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

4. **Access the Application**
   - Open browser: `http://localhost:5173`
   - Default credentials available in README.md

---

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Single Container Build

```bash
# Build the Docker image
docker build -t student-management-system .

# Run the container
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb://localhost:27017/sms" \
  -e JWT_SECRET="your-secret-key" \
  student-management-system
```

### Docker Compose (Recommended)

1. **Configuration**
   ```bash
   # Copy example .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   # nano .env
   ```

2. **Deploy**
   ```bash
   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

3. **Services**
   - MongoDB: `mongodb://admin:password@localhost:27017`
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost`
   - Nginx: `http://localhost:80`

---

## Production Deployment

### Backend Build & Deployment

1. **Build for Production**
   ```bash
   cd backend
   npm install --production
   NODE_ENV=production npm start
   ```

2. **Environment Setup**
   ```bash
   # Create .env for production
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sms
   JWT_SECRET=<your-strong-secret-key>
   JWT_EXPIRE=7d
   ```

3. **Process Manager** (PM2 Recommended)
   ```bash
   # Install PM2 globally
   npm install -g pm2

   # Start application
   pm2 start backend/server.js --name "sms-backend"

   # Save PM2 process list
   pm2 save

   # Enable startup on reboot
   pm2 startup
   ```

### Frontend Build & Deployment

1. **Build for Production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Output**: Production files in `frontend/dist/`

3. **Serve Static Files**
   - Use Nginx/Apache to serve `dist/` folder
   - Configure API proxy to backend

---

## Cloud Deployment

### Heroku Deployment

1. **Prerequisites**
   ```bash
   brew install heroku/brew/heroku  # macOS
   heroku login
   ```

2. **Backend Deployment**
   ```bash
   cd backend
   git init
   heroku create your-app-backend
   git push heroku main
   
   # Set environment variables
   heroku config:set JWT_SECRET=your-secret
   heroku config:set MONGODB_URI=your-mongodb-uri
   ```

3. **Frontend Deployment**
   ```bash
   cd ../frontend
   npm run build
   
   # Deploy to Vercel, Netlify, or GitHub Pages
   ```

### AWS Deployment

#### Using EC2
1. Launch EC2 instance (Ubuntu 20.04)
2. Connect via SSH
3. Install Node.js and MongoDB
4. Clone repository
5. Follow production deployment steps
6. Configure security groups

#### Using Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init -p node.js-18 sms-backend

# Create environment
eb create sms-prod

# Deploy
eb deploy
```

#### Using RDS for MongoDB
- Replace local MongoDB with AWS DocumentDB or MongoDB Atlas
- Update MONGODB_URI in environment variables

### DigitalOcean Deployment

1. **Create Droplet**
   - Ubuntu 20.04, 2GB RAM minimum
   - Enable backups

2. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo apt-get install -y mongodb
   sudo apt-get install -y nginx
   ```

4. **Deploy Application**
   ```bash
   git clone your-repo-url
   cd student-management-system/backend
   npm install --production
   pm2 start server.js
   ```

5. **Configure Nginx**
   - Edit `/etc/nginx/sites-available/default`
   - Point to backend and frontend
   - Enable HTTPS with Let's Encrypt

### Vercel Deployment (Frontend)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure Environment**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```
4. **Deploy** - Automatic on push

### Netlify Deployment (Frontend)

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

2. **Environment Variables**
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

3. **Deploy** - Drag & drop or Git integration

---

## Database Setup

### MongoDB Atlas (Cloud MongoDB)

1. **Create Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create Cluster**
   - Free tier available
   - Choose region

3. **Get Connection String**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/sms?retryWrites=true&w=majority
   ```

4. **Update .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sms
   ```

### Local MongoDB

```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb
sudo systemctl start mongodb

# Windows
# Download installer from mongodb.com
```

---

## SSL/TLS Setup

### Using Let's Encrypt with Nginx

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate Certificate
sudo certbot certonly --nginx -d yourdomain.com

# Update Nginx Configuration
# Add to server block:
# ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Monitoring & Logging

### Application Monitoring

```bash
# Using PM2 monitoring
pm2 monit

# View logs
pm2 logs sms-backend

# Create log file
pm2 save
pm2 startup
```

### Docker Logs

```bash
docker-compose logs -f backend
docker-compose logs -f mongodb
```

---

## Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Minify assets
   - Use CDN for static files
   - Lazy load components

2. **Backend**
   - Database indexing
   - Caching with Redis
   - Connection pooling
   - Load balancing

3. **Database**
   - Regular backups
   - Index optimization
   - Query optimization

---

## Troubleshooting

### Backend Won't Start
```bash
# Check port in use
lsof -i :5000

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
env | grep MONGODB
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017

# Check connection string
echo $MONGODB_URI
```

### Frontend Not Loading
- Check API_BASE_URL environment variable
- Verify backend is running
- Check CORS configuration
- Clear browser cache

---

## Backup & Recovery

### MongoDB Backup

```bash
# Backup
mongodump --out /backup/sms-backup

# Restore
mongorestore /backup/sms-backup
```

### Docker Volumes Backup

```bash
# Backup
docker run --rm -v sms-mongodb:/data -v /backup:/backup \
  alpine tar czf /backup/mongodb-backup.tar.gz -C /data .

# Restore
docker run --rm -v sms-mongodb:/data -v /backup:/backup \
  alpine tar xzf /backup/mongodb-backup.tar.gz -C /data
```

---

## Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong MongoDB password
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS only for trusted domains
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Monitor access logs

---

For more information, refer to [README.md](./README.md)
