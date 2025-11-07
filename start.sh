#!/bin/bash

# City Guardian Image Analyzer - Auto Run Script
# This script automatically starts both backend and frontend servers

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🚀 City Guardian Image Analyzer - Auto Start        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -i:$1 > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    echo -e "${YELLOW}⚠️  Port $1 is already in use. Killing existing process...${NC}"
    lsof -ti:$1 | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Step 1: Check and install dependencies
echo -e "${BLUE}📦 Step 1: Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing npm dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 2: Clean up existing servers
echo -e "${BLUE}🧹 Step 2: Cleaning up existing servers...${NC}"
if check_port 3000; then
    kill_port 3000
    echo -e "${GREEN}✅ Killed process on port 3000${NC}"
fi

if check_port 8000; then
    kill_port 8000
    echo -e "${GREEN}✅ Killed process on port 8000${NC}"
fi
echo ""

# Step 3: Start Backend Server
echo -e "${BLUE}🚀 Step 3: Starting Backend API Server...${NC}"
cd /workspaces/Image-Analyzer
mkdir -p logs
touch logs/backend.log logs/frontend.log
NODE_ENV=development node api/index.js > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo "   Logs: logs/backend.log"
echo ""

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 3

# Test backend
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding!${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi
echo ""

# Step 4: Start Frontend Server
echo -e "${BLUE}🌐 Step 4: Starting Frontend Server...${NC}"
cd /workspaces/Image-Analyzer/frontend
python3 -m http.server 8000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo "   Logs: logs/frontend.log"
echo ""

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 2

# Test frontend
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding!${NC}"
else
    echo -e "${RED}❌ Frontend failed to start. Check logs/frontend.log${NC}"
    exit 1
fi
echo ""

# Step 5: Run Connection Tests
echo -e "${BLUE}🧪 Step 5: Running Connection Tests...${NC}"
echo ""

# Test 1: Backend Health
echo -n "   Test 1 - Backend Health: "
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 2: Categories Endpoint
echo -n "   Test 2 - Categories API: "
CATEGORIES_RESPONSE=$(curl -s http://localhost:3000/api/categories)
if echo "$CATEGORIES_RESPONSE" | grep -q "success"; then
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ PASS${NC} (${CATEGORY_COUNT} categories)"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 3: Frontend Serving
echo -n "   Test 3 - Frontend Server: "
if curl -s -I http://localhost:8000 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# Test 4: CORS Configuration
echo -n "   Test 4 - CORS Headers:   "
CORS_RESPONSE=$(curl -s -I http://localhost:3000/api/health -H "Origin: http://localhost:8000" | grep -i "access-control-allow-origin")
if [ ! -z "$CORS_RESPONSE" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""

# Step 6: Display Access Information
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║              ✅ ALL SYSTEMS RUNNING!                     ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Access URLs:${NC}"
echo ""

# Detect if in Codespaces
if [ ! -z "$CODESPACE_NAME" ]; then
    echo -e "${BLUE}GitHub Codespaces Environment Detected!${NC}"
    echo ""
    echo -e "${GREEN}📱 Frontend (Main App):${NC}"
    echo "   https://$CODESPACE_NAME-8000.app.github.dev"
    echo ""
    echo -e "${GREEN}🔧 Quick Test Page:${NC}"
    echo "   https://$CODESPACE_NAME-8000.app.github.dev/quick-test.html"
    echo ""
    echo -e "${GREEN}🧪 Diagnostic Page:${NC}"
    echo "   https://$CODESPACE_NAME-8000.app.github.dev/diagnostic.html"
    echo ""
    echo -e "${GREEN}🔌 Backend API:${NC}"
    echo "   https://$CODESPACE_NAME-3000.app.github.dev/api/health"
    echo ""
else
    echo -e "${GREEN}📱 Frontend (Main App):${NC}"
    echo "   http://localhost:8000"
    echo ""
    echo -e "${GREEN}🔧 Quick Test Page:${NC}"
    echo "   http://localhost:8000/quick-test.html"
    echo ""
    echo -e "${GREEN}🧪 Diagnostic Page:${NC}"
    echo "   http://localhost:8000/diagnostic.html"
    echo ""
    echo -e "${GREEN}🔌 Backend API:${NC}"
    echo "   http://localhost:3000/api/health"
    echo ""
fi

echo -e "${BLUE}📊 System Status:${NC}"
echo "   Backend:  Running on port 3000 (PID: $BACKEND_PID)"
echo "   Frontend: Running on port 8000 (PID: $FRONTEND_PID)"
echo "   Model:    Not trained (run 'npm run train' to train)"
echo ""

echo -e "${YELLOW}📋 Process Management:${NC}"
echo "   View backend logs:  tail -f logs/backend.log"
echo "   View frontend logs: tail -f logs/frontend.log"
echo "   Stop all servers:   ./stop-servers.sh"
echo ""

echo -e "${GREEN}💡 Next Steps:${NC}"
echo "   1. Open the frontend URL in your browser"
echo "   2. Try uploading an image (analysis won't work until model is trained)"
echo "   3. Train the model: npm run train"
echo "   4. Deploy to production: See DEPLOYMENT.md"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✨ Ready to use! Press Ctrl+C to stop monitoring.${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Keep script running and show logs
echo -e "${BLUE}📝 Monitoring logs (Ctrl+C to stop)...${NC}"
echo ""
tail -f logs/backend.log logs/frontend.log
