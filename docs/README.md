# Cognisia's Forge 1 - Full-Stack Python Project

## 📋 Project Overview

Cognisia's Forge 1 is a production-ready AI employee generator platform featuring multi-LLM orchestration, emotional intelligence, and enterprise-grade monitoring. This project has been converted from a Next.js/TypeScript stack to a full-stack Python implementation using FastAPI and React.

## 🏗️ Architecture

### Backend (Python + FastAPI)
- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM with SQLite for development
- **Socket.IO**: Real-time communication
- **Pydantic**: Data validation and serialization
- **Alembic**: Database migrations
- **Celery**: Background task processing
- **Redis**: Caching and message broker

### Frontend (React + TypeScript)
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Premium component library
- **React Query**: Server state management
- **Socket.IO Client**: Real-time updates

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis (optional, for caching)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd forge1-python
./scripts/setup.sh
```

### 2. Configure Environment
Edit the `.env` files with your API keys:

**Backend (.env)**:
```env
DATABASE_URL=sqlite:///./data/forge1.db
SECRET_KEY=your-secret-key-change-in-production
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key
```

### 3. Start Development Servers
```bash
# Start all services
./scripts/start.sh

# Or start individually:
# Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
forge1-python/
├── backend/                 # Python FastAPI backend
│   ├── app/                 # FastAPI application
│   │   ├── main.py         # Main application entry
│   │   └── api/            # API routers
│   ├── core/               # Core configuration
│   ├── models/             # Database models and schemas
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── tests/              # Test files
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── docs/                   # Documentation
├── scripts/                # Setup and deployment scripts
└── docker-compose.yml      # Docker configuration
```

## 🔧 Key Features

### Multi-LLM Orchestration
- **Simultaneous Model Collaboration**: GPT-4o, Claude Opus 4, Gemini Flash 2.5
- **Dynamic Task Routing**: Automatically selects best model based on task type
- **Load Balancing**: Distributes requests across available models
- **Cost Optimization**: Minimizes costs while maintaining quality

### Emotional Intelligence
- **Emotion Analysis**: Detects user emotions from text
- **Empathetic Responses**: Generates contextually appropriate responses
- **Adaptive Communication**: Adjusts communication style based on user state
- **Sentiment Analysis**: Tracks conversation sentiment over time

### Advanced Monitoring
- **Real-time Dashboard**: Monitor agent performance and system health
- **Performance Analytics**: Track response times, success rates, and user satisfaction
- **System Health**: Monitor database, AI services, and infrastructure
- **Alert System**: Get notified about issues and anomalies

### Enterprise Features
- **Authentication & Authorization**: JWT-based auth with role-based access
- **Audit Logging**: Track all user actions and system events
- **Scalable Architecture**: Designed for horizontal scaling
- **Production Ready**: Docker deployment with health checks

## 🛠️ Development

### Backend Development
```bash
cd backend
source venv/bin/activate

# Run tests
pytest

# Run with auto-reload
uvicorn app.main:app --reload

# Database migrations
alembic upgrade head
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Database Management
```bash
cd backend

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down
```

### Production Deployment
1. **Environment Configuration**: Set up production environment variables
2. **Database**: Use PostgreSQL instead of SQLite for production
3. **SSL/TLS**: Configure HTTPS with reverse proxy
4. **Monitoring**: Set up logging and monitoring
5. **Scaling**: Configure load balancer and multiple instances

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 📊 API Documentation

Once the backend is running, visit:
- **FastAPI Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### AI Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/{id}` - Get agent details
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `POST /api/agents/{id}/deploy` - Deploy agent
- `POST /api/agents/{id}/test` - Test agent

#### Forge 1 Features
- `POST /api/forge1/multimodal` - Process multimodal inputs
- `POST /api/forge1/multi-llm` - Multi-LLM orchestration
- `POST /api/forge1/emotional-intelligence` - Emotional processing
- `POST /api/forge1/agent/{id}/chat` - Chat with agent

#### Health & Monitoring
- `GET /api/health/` - System health status
- `GET /api/health/database` - Database health
- `GET /api/health/ai-services` - AI services health
- `GET /api/health/metrics` - System metrics

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=Cognisia's Forge 1
APP_VERSION=1.0.0
DEBUG=false

# Database
DATABASE_URL=sqlite:///./data/forge1.db

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key

# Redis
REDIS_URL=redis://localhost:6379

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
NODE_ENV=development
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Run full test suite
./scripts/test.sh
```

## 📈 Performance

### Benchmarks
- **API Response Time**: <100ms average
- **Database Queries**: <50ms average
- **Frontend Load Time**: <2s
- **Memory Usage**: <512MB per service
- **CPU Usage**: <50% under normal load

### Optimization
- **Database**: Indexed queries, connection pooling
- **API**: Async processing, caching
- **Frontend**: Code splitting, lazy loading
- **Assets**: Optimized images, minified CSS/JS

## 🔒 Security

### Authentication
- JWT tokens with expiration
- Password hashing with bcrypt
- Secure cookie handling
- CSRF protection

### Authorization
- Role-based access control
- Resource ownership validation
- API rate limiting
- Input validation and sanitization

### Data Protection
- Encrypted sensitive data
- Secure file uploads
- SQL injection prevention
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test` and `pytest`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend code
- Write comprehensive tests
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI**: For the amazing async web framework
- **React**: For the powerful frontend library
- **OpenAI**: For GPT models and APIs
- **Anthropic**: For Claude models
- **Google**: For Gemini models
- **shadcn/ui**: For the beautiful component library

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Join our community discussions

---

🔥 **FORGE 1: ENTERPRISE-GRADE AI EMPLOYEE GENERATOR** 🔥