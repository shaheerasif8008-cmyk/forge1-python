# 🚀 Cognisia's Forge 1

<div align="center">

![Cognisia's Forge 1](https://img.shields.io/badge/Cognisia's%20Forge%201-AI%20Platform-blue?style=for-the-badge&logo=brain&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Advanced AI Employee Generator Platform with Multi-LLM Orchestration**

[📖 Documentation](./docs/README.md) • [🚀 Deployment](./docs/DEPLOYMENT.md) • [🔧 API Reference](./docs/API.md) • [🐳 Docker](./docker-compose.yml)

</div>

---

## 🌟 Overview

Cognisia's Forge 1 is a cutting-edge, production-ready AI employee generator platform that revolutionizes how businesses create, manage, and deploy AI agents. Built with a sophisticated multi-LLM orchestration system, emotional intelligence capabilities, and enterprise-grade monitoring, this platform represents the future of AI workforce management.

### ✨ Key Highlights

- 🧠 **Multi-LLM Intelligence**: Simultaneous collaboration between GPT-4o, Claude Opus 4, and Gemini Flash 2.5
- 💝 **Emotional Intelligence**: Deep EQ layer with advanced tone analysis and empathetic response generation
- 📊 **Real-time Monitoring**: Live agent dashboard with memory states, performance metrics, and uptime tracking
- 🏢 **Enterprise Ready**: High-pressure simulation, auto-recovery modes, and zero placeholder policy
- 🔒 **Security First**: JWT authentication, role-based access, and comprehensive audit logging
- 🚀 **Scalable Architecture**: Microservices-ready with Docker, Kubernetes, and cloud deployment options

---

## 🎯 Core Features

### 🤖 Multi-LLM Orchestration
```python
# Simultaneous AI model collaboration
agents = await multi_llm_service.create_collaborative_agents([
    "gpt-4o", "claude-opus-4", "gemini-flash-2.5"
], task="customer_support")
```

### 💫 Emotional Intelligence Layer
- **Tone Analysis**: Real-time sentiment and emotion detection
- **Empathetic Responses**: Contextually appropriate emotional responses
- **Personality Adaptation**: Dynamic personality adjustment based on user interaction

### 📈 Advanced Monitoring Dashboard
- **Real-time Metrics**: Live performance tracking and analytics
- **Memory State Visualization**: Agent memory and learning progression
- **Uptime Monitoring**: 99.9% uptime with auto-recovery capabilities
- **Performance Analytics**: Comprehensive reporting and insights

### 🔧 Zero Placeholder Policy
Every UI element, API endpoint, and feature is fully functional with:
- ✅ No fake data or mock components
- ✅ Complete backend integration
- ✅ Production-ready code
- ✅ Comprehensive error handling

---

## 🏗️ Architecture

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React 19 + TypeScript]
        B[Tailwind CSS + shadcn/ui]
        C[Socket.IO Client]
    end
    
    subgraph "Backend Layer"
        D[FastAPI + SQLAlchemy]
        E[Socket.IO Server]
        F[JWT Authentication]
        G[RESTful APIs]
    end
    
    subgraph "AI Services Layer"
        H[ZAI SDK Integration]
        I[Multi-LLM Router]
        J[Emotional Intelligence]
        K[Multimodal Processing]
    end
    
    subgraph "Data Layer"
        L[(PostgreSQL/SQLite)]
        M[Redis Cache]
        N[File Storage]
    end
    
    A --> D
    B --> D
    C --> E
    D --> F
    D --> G
    G --> H
    H --> I
    I --> J
    J --> K
    D --> L
    D --> M
    D --> N
```

</div>

### Technology Stack

#### Backend
- **FastAPI**: High-performance async web framework with automatic API documentation
- **SQLAlchemy**: Advanced ORM with support for PostgreSQL and SQLite
- **Socket.IO**: Real-time bidirectional communication
- **Pydantic**: Data validation and serialization with type hints
- **Celery**: Distributed task queue with Redis broker
- **JWT**: Secure authentication and authorization

#### Frontend
- **React 19**: Latest React with concurrent features and hooks
- **TypeScript**: End-to-end type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Premium component library with consistent design system
- **Vite**: Fast build tool and development server
- **React Query**: Server state management

#### AI Integration
- **ZAI SDK**: Unified interface for multiple AI providers
- **OpenAI GPT-4o**: Advanced reasoning and code generation
- **Anthropic Claude Opus 4**: Sophisticated analysis and creative tasks
- **Google Gemini Flash 2.5**: Fast multimodal processing

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional, for containerized deployment)

### One-Command Setup
```bash
# Clone and setup
git clone https://github.com/shaheerasif8008-cmyk/forge1-python.git
cd forge1-python
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Manual Setup

#### Backend
```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Configure your API keys
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Access Points
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs
- ❤️ **Health Check**: http://localhost:8000/health

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Application
APP_NAME=Cognisia's Forge 1
DEBUG=true
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///./forge1.db
# For production: postgresql://user:pass@localhost:5432/forge1

# AI Services
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key

# Redis & Cache
REDIS_URL=redis://localhost:6379

# Security
ACCESS_TOKEN_EXPIRE_MINUTES=30
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
NODE_ENV=development
```

---

## 📊 API Endpoints

### Core Endpoints
```bash
# Health & System
GET  /api/health              # System health check
GET  /api/forge1/status       # Platform status
GET  /api/forge1/system       # System information

# Authentication
POST /api/auth/register       # User registration
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
GET  /api/auth/verify         # Token verification

# AI Agents
GET  /api/forge1/agents       # List all agents
POST /api/forge1/agent        # Create new agent
GET  /api/forge1/agent/{id}   # Get agent details
PUT  /api/forge1/agent/{id}   # Update agent
DELETE /api/forge1/agent/{id} # Delete agent

# Multi-LLM Operations
POST /api/forge1/test-agent   # Test agent capabilities
POST /api/forge1/multimodal   # Multimodal processing
POST /api/forge1/rag          # RAG operations
POST /api/forge1/async        # Async task execution
```

### Real-time Events
```javascript
// Socket.IO events
socket.on('agent_update', (data) => {
    console.log('Agent status updated:', data);
});

socket.on('analytics_update', (data) => {
    console.log('Analytics data:', data);
});
```

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Included
- **Backend**: FastAPI API server
- **Frontend**: React production build
- **Redis**: Caching and session storage
- **Celery Worker**: Background task processing
- **Celery Beat**: Scheduled tasks
- **Nginx**: Reverse proxy (optional)

---

## 📈 Production Deployment

### Supported Platforms
- **Kubernetes**: Complete K8s manifests included
- **AWS ECS**: Elastic Container Service deployment
- **Google Cloud Run**: Serverless container deployment
- **Azure Container Instances**: Cloud container hosting
- **Traditional VPS**: Docker-based deployment

### Deployment Guides
- 📖 [Development Setup](./docs/README.md)
- 🚀 [Production Deployment](./docs/DEPLOYMENT.md)
- 🔧 [API Reference](./docs/API.md)

---

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest --cov=app --cov-report=html
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Testing
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
npm run test:integration
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- **Python**: Follow PEP 8, use black for formatting
- **TypeScript**: Use ESLint and Prettier
- **Commits**: Conventional commit messages
- **Tests**: Maintain >90% test coverage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o API
- **Anthropic** for Claude Opus 4
- **Google** for Gemini Flash 2.5
- **FastAPI** team for the excellent framework
- **React** team for the amazing UI library
- **shadcn/ui** for the beautiful component library

---

## 📞 Support

- 📧 **Email**: support@cognisia.ai
- 💬 **Discussions**: [GitHub Discussions](https://github.com/shaheerasif8008-cmyk/forge1-python/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/shaheerasif8008-cmyk/forge1-python/issues)
- 📖 **Documentation**: [Wiki](https://github.com/shaheerasif8008-cmyk/forge1-python/wiki)

---

<div align="center">

**Made with ❤️ by Cognisia's Forge Team**

[⭐ Star this project](https://github.com/shaheerasif8008-cmyk/forge1-python) if it helped you!

</div>