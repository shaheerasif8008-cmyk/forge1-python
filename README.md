# Cognisia's Forge 1 - Python Full-Stack Implementation

A production-ready AI employee generator platform with multi-LLM orchestration, emotional intelligence, and enterprise-grade monitoring.

## 🚀 Features

- **Multi-LLM Orchestration**: Simultaneous collaboration between GPT-4o, Claude Opus 4, Gemini Flash 2.5
- **Emotional Intelligence**: Deep EQ layer with tone analysis and empathetic responses
- **Advanced Monitoring**: Real-time agent dashboard with memory states and uptime tracking
- **Enterprise Testing**: High-pressure simulation and auto-recovery modes
- **Zero Placeholder Policy**: Every UI element corresponds to real, working functionality

## 🏗️ Architecture

### Backend (FastAPI + SQLAlchemy)
- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM with SQLite for development
- **Socket.IO**: Real-time communication
- **ZAI SDK**: Integration with multiple AI models
- **Pydantic**: Data validation and serialization

### Frontend (React + TypeScript)
- **React 19**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Premium component library
- **Socket.IO Client**: Real-time updates

## 📦 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- SQLite3

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in backend directory:
```env
DATABASE_URL=sqlite:///./forge1.db
SECRET_KEY=your-secret-key-here
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
```

## 📊 API Documentation

Once running, visit:
- **FastAPI Docs**: http://localhost:8000/docs
- **Frontend**: http://localhost:3000

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📈 Production Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.