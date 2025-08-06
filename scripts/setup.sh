#!/bin/bash

# Cognisia's Forge 1 Development Setup Script

set -e

echo "🚀 Setting up Cognisia's Forge 1 development environment..."

# Check if Python 3.11+ is installed
if ! command -v python3.11 &> /dev/null; then
    echo "❌ Python 3.11 is required but not installed."
    exit 1
fi

# Check if Node.js 18+ is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ is required but not installed."
    exit 1
fi

# Create virtual environment for backend
echo "📦 Creating Python virtual environment..."
cd backend
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data uploads static

# Initialize database
echo "🗄️  Initializing database..."
python -c "from core.database import create_tables; create_tables()"

cd ..

# Setup frontend
echo "⚛️  Setting up frontend..."
cd frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

cd ..

# Create environment files
echo "🔧 Creating environment files..."

# Backend .env
cat > backend/.env << EOF
DATABASE_URL=sqlite:///./data/forge1.db
SECRET_KEY=your-secret-key-change-in-production-$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REDIS_URL=redis://localhost:6379
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:8000"]
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads

# AI Service Keys (add your actual keys)
ZAI_API_KEY=your-zai-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_API_KEY=your-google-api-key
EOF

# Frontend .env
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
NODE_ENV=development
EOF

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Add your AI service API keys to backend/.env"
echo "2. Start Redis: redis-server"
echo "3. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation: See docs/ for detailed instructions"