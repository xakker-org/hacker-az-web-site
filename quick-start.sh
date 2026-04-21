#!/bin/bash
# ============================================
# Xakker.org Quick Start Script
# ============================================

set -e

PROJECT_DIR="/home/maharrammasimov/hacker-az-web-site"
cd "$PROJECT_DIR"

echo "🚀 Xakker.org - Premium Cybersecurity Platform"
echo "=================================================="
echo ""

echo "  Landing Page:    http://xakker.org:8000"
echo "  Auth/Platform:   http://self-study.xakker.org:8000"
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if /etc/hosts is configured
echo -e "${BLUE}📋 Checking system configuration...${NC}"
if grep -q "xakker.org" /etc/hosts 2>/dev/null; then
    echo -e "${GREEN}✅ /etc/hosts contains xakker.org${NC}"
else
    echo -e "${YELLOW}⚠️  Note: You need to add entries to /etc/hosts:${NC}"
    echo "   127.0.0.1 xakker.org"
    echo "   127.0.0.1 self-study.xakker.org"
    echo "   Run: echo '127.0.0.1 xakker.org' | sudo tee -a /etc/hosts"
    echo ""
fi

# Check Python
echo -e "${BLUE}🐍 Checking Python environment...${NC}"
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found. Creating...${NC}"
    python -m venv .venv
    .venv/bin/pip install -r requirements.txt
fi
echo -e "${GREEN}✅ Python environment ready${NC}"

# Check Node
echo -e "${BLUE}📦 Checking Node.js environment...${NC}"
if [ ! -d "frontend/react/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Node dependencies not found. Installing...${NC}"
    cd frontend/react
    npm install
    cd - > /dev/null
fi
echo -e "${GREEN}✅ Node.js environment ready${NC}"

# Run migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
.venv/bin/python manage.py migrate --noinput
echo -e "${GREEN}✅ Migrations complete${NC}"

echo ""
echo -e "${GREEN}=================================================="
echo "✅ Setup Complete!"
echo "==================================================${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "Option 1: Run with separate terminals (Recommended)"
echo "  Terminal 1: cd $PROJECT_DIR && .venv/bin/python manage.py runserver 0.0.0.0:8000"
echo "  Terminal 2: cd $PROJECT_DIR/frontend/react && npm run dev"
echo ""
echo "Option 2: Run with Docker"
echo "  docker-compose up"
echo ""
echo -e "${BLUE}📍 Access Points:${NC}"
echo "  Landing Page:    http://xakker.org:8000"
echo "  Auth/Platform:   http://self-study.xakker.org:8000"
echo "  API:             http://localhost:8000/api"
echo "  Frontend Dev:    http://localhost:5173"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  Setup Guide:     ./SETUP_GUIDE.md"
echo "  Local Setup:     ./LOCAL_SETUP.md"
echo ""
