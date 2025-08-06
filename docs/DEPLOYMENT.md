# Deployment Guide

This guide covers deploying Cognisia's Forge 1 to production environments.

## 🎯 Deployment Options

### 1. Docker Compose (Recommended for Development/Testing)

#### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd forge1-python

# Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit environment files with your configuration
nano backend/.env
nano frontend/.env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs
```

#### Services Started
- **Backend**: FastAPI API on port 8000
- **Frontend**: React app on port 3000
- **Redis**: Caching on port 6379
- **Celery Worker**: Background tasks
- **Celery Beat**: Scheduled tasks
- **Nginx**: Reverse proxy (optional)

### 2. Kubernetes Production Deployment

#### Prerequisites
- Kubernetes cluster (minikube, EKS, GKE, AKS)
- kubectl configured
- Helm 3+

#### Deployment Steps

1. **Prepare Configuration**
```bash
# Create namespace
kubectl create namespace forge1

# Create secrets
kubectl create secret generic forge1-secrets \
  --from-literal=secret-key=$(openssl rand -hex 32) \
  --from-literal=database-url=$DATABASE_URL \
  --from-literal=zai-api-key=$ZAI_API_KEY \
  --from-literal=openai-api-key=$OPENAI_API_KEY \
  --from-literal=anthropic-api-key=$ANTHROPIC_API_KEY \
  --from-literal=google-api-key=$GOOGLE_API_KEY \
  -n forge1
```

2. **Deploy Database**
```bash
# Deploy PostgreSQL
kubectl apply -f k8s/postgresql.yaml -n forge1

# Deploy Redis
kubectl apply -f k8s/redis.yaml -n forge1
```

3. **Deploy Backend**
```bash
# Apply backend deployment
kubectl apply -f k8s/backend.yaml -n forge1

# Apply backend service
kubectl apply -f k8s/backend-service.yaml -n forge1
```

4. **Deploy Frontend**
```bash
# Apply frontend deployment
kubectl apply -f k8s/frontend.yaml -n forge1

# Apply frontend service
kubectl apply -f k8s/frontend-service.yaml -n forge1
```

5. **Deploy Ingress**
```bash
# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml -n forge1
```

### 3. Cloud Platform Deployment

#### AWS ECS

1. **Build and Push Images**
```bash
# Build backend image
docker build -t forge1-backend:latest ./backend
docker tag forge1-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/forge1-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/forge1-backend:latest

# Build frontend image
docker build -t forge1-frontend:latest ./frontend
docker tag forge1-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/forge1-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/forge1-frontend:latest
```

2. **Deploy using ECS CLI**
```bash
# Create ECS cluster
ecs-cli up --cluster forge1 --region $AWS_REGION

# Deploy services
ecs-cli compose --project-name forge1 up \
  --cluster forge1 \
  --region $AWS_REGION
```

#### Google Cloud Run

1. **Deploy Backend**
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/$PROJECT_ID/forge1-backend ./backend
gcloud run deploy forge1-backend \
  --image gcr.io/$PROJECT_ID/forge1-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated
```

2. **Deploy Frontend**
```bash
# Build and deploy frontend
gcloud builds submit --tag gcr.io/$PROJECT_ID/forge1-frontend ./frontend
gcloud run deploy forge1-frontend \
  --image gcr.io/$PROJECT_ID/forge1-frontend \
  --platform managed \
  --region $REGION \
  --set-env-vars=VITE_API_URL=$BACKEND_URL
```

#### Azure Container Instances

1. **Create Resource Group**
```bash
az group create --name forge1-rg --location $LOCATION
```

2. **Deploy Containers**
```bash
# Deploy backend
az container create \
  --resource-group forge1-rg \
  --name forge1-backend \
  --image $ACR_NAME.azurecr.io/forge1-backend:latest \
  --dns-name-label forge1-backend-$RANDOM \
  --ports 8000

# Deploy frontend
az container create \
  --resource-group forge1-rg \
  --name forge1-frontend \
  --image $ACR_NAME.azurecr.io/forge1-frontend:latest \
  --dns-name-label forge1-frontend-$RANDOM \
  --ports 3000
```

## 🔧 Production Configuration

### Environment Variables

#### Backend Production Environment
```env
# Application
APP_NAME=Cognisia's Forge 1
APP_VERSION=1.0.0
DEBUG=false

# Database (Production PostgreSQL)
DATABASE_URL=postgresql://user:password@postgres:5432/forge1

# Security
SECRET_KEY=your-very-secure-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
ZAI_API_KEY=your-production-zai-api-key
OPENAI_API_KEY=your-production-openai-api-key
ANTHROPIC_API_KEY=your-production-anthropic-api-key
GOOGLE_API_KEY=your-production-google-api-key

# Redis
REDIS_URL=redis://redis:6379/0

# CORS (Production domains)
BACKEND_CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/app/uploads

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

#### Frontend Production Environment
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Database Configuration

#### PostgreSQL Setup
```sql
-- Create database and user
CREATE DATABASE forge1;
CREATE USER forge1_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE forge1 TO forge1_user;
GRANT ALL ON SCHEMA public TO forge1_user;

-- Apply migrations
alembic upgrade head
```

#### Database Optimization
```sql
-- Add indexes for performance
CREATE INDEX idx_agents_user_id ON ai_agents(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX idx_tool_executions_agent_id ON tool_executions(agent_id);
```

### Reverse Proxy Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend
    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin https://yourdomain.com;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📊 Monitoring and Logging

### Health Checks

#### Backend Health Check
```python
# app/api/health.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.app_version,
        "database": "connected",
        "redis": "connected"
    }
```

#### Frontend Health Check
```javascript
// src/utils/health.js
export const checkHealth = async () => {
  try {
    const response = await fetch('/api/health');
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy' };
  }
};
```

### Logging Configuration

#### Backend Logging
```python
# core/logging.py
import logging
import sys
from pathlib import Path

def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / "app.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Reduce noise from some loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
```

### Monitoring Setup

#### Prometheus Metrics
```python
# app/metrics.py
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
REQUEST_COUNT = Counter('forge1_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('forge1_request_duration_seconds', 'Request duration')
ACTIVE_USERS = Gauge('forge1_active_users', 'Number of active users')
AGENT_COUNT = Gauge('forge1_agents_total', 'Total number of agents')
```

#### Grafana Dashboard
Create a Grafana dashboard with panels for:
- Request rate and duration
- Error rates
- Database performance
- Redis usage
- System resources (CPU, memory, disk)
- Active users and agents

## 🔒 Security Considerations

### SSL/TLS Configuration
```bash
# Generate SSL certificates with Let's Encrypt
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew certificates
0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### Security Headers
```nginx
# Add to nginx configuration
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
```

## 🚀 Scaling Strategies

### Horizontal Scaling

#### Backend Scaling
```yaml
# docker-compose.prod.yml
backend:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

#### Database Scaling
- **Read Replicas**: Offload read queries to replicas
- **Connection Pooling**: Use PgBouncer for connection management
- **Sharding**: Distribute data across multiple database instances

### Load Balancing

#### Application Load Balancer
```yaml
# ALB configuration
Resources:
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Subnets: !Ref Subnets
      SecurityGroups: !Ref SecurityGroups
      Scheme: internet-facing
```

#### Session Management
- Use Redis for session storage
- Configure sticky sessions if needed
- Implement circuit breakers for resilience

## 📈 Performance Optimization

### Caching Strategy

#### Redis Caching
```python
# services/cache.py
import redis
import json

class CacheService:
    def __init__(self):
        self.redis_client = redis.Redis.from_url(settings.redis_url)
    
    async def get(self, key: str):
        cached = self.redis_client.get(key)
        return json.loads(cached) if cached else None
    
    async def set(self, key: str, value: any, expire: int = 3600):
        self.redis_client.setex(key, expire, json.dumps(value))
```

### Database Optimization

#### Query Optimization
```python
# Use efficient queries
from sqlalchemy.orm import joinedload

# Good: Use joinedload to avoid N+1 queries
agents = db.query(Agent).options(joinedload(Agent.user)).all()

# Bad: N+1 queries
agents = db.query(Agent).all()
for agent in agents:
    print(agent.user.name)  # Additional query for each agent
```

### Frontend Optimization

#### Code Splitting
```javascript
// React.lazy for component splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AgentsPage = React.lazy(() => import('./pages/AgentsPage'));

// Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/agents" element={<AgentsPage />} />
  </Routes>
</Suspense>
```

## 🔄 CI/CD Pipeline

### GitHub Actions Configuration

#### .github/workflows/deploy.yml
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to ECS
        run: |
          # Deployment commands here
          aws ecs update-service --cluster forge1 --service forge1-backend --force-new-deployment
```

### Automated Testing

#### Test Suite
```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_create_agent():
    response = client.post(
        "/api/agents",
        json={
            "name": "Test Agent",
            "type": "generalist",
            "role": "Assistant"
        }
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Memory Issues
```bash
# Check memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 2g
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Force renew certificate
certbot renew --force-renewal

# Check nginx configuration
nginx -t
```

### Performance Issues

#### Slow API Responses
```python
# Enable query logging
import logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Check slow queries
EXPLAIN ANALYZE SELECT * FROM ai_agents WHERE user_id = 'user_id';

# Add database indexes
CREATE INDEX CONCURRENTLY idx_agents_user_created ON ai_agents(user_id, created_at);
```

#### High Memory Usage
```bash
# Check memory usage by process
ps aux --sort=-%mem

# Monitor Redis memory
redis-cli info memory

# Clear cache if needed
redis-cli FLUSHDB
```

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

This deployment guide covers the essential aspects of deploying Cognisia's Forge 1 to production. For specific cloud providers or custom requirements, additional configuration may be needed.