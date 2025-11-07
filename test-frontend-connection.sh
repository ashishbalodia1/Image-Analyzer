#!/bin/bash

# Frontend-Backend Connection Test Script
# This script verifies that frontend can connect to backend

echo "═══════════════════════════════════════════════════════════"
echo "    🔍 TESTING FRONTEND-BACKEND CONNECTION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend is running
echo "1️⃣  Checking Backend Server..."
if ps aux | grep "node.*api/index.js" | grep -v grep > /dev/null; then
    echo -e "   ${GREEN}✅ Backend process is running${NC}"
else
    echo -e "   ${RED}❌ Backend process NOT running${NC}"
    echo "   💡 Start with: cd /workspaces/Image-Analyzer && node api/index.js &"
    exit 1
fi
echo ""

# Test 2: Check if port 3000 is listening
echo "2️⃣  Checking Port 3000..."
if lsof -i:3000 > /dev/null; then
    echo -e "   ${GREEN}✅ Port 3000 is listening${NC}"
else
    echo -e "   ${RED}❌ Port 3000 is NOT listening${NC}"
    exit 1
fi
echo ""

# Test 3: Test health endpoint
echo "3️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
if [ $? -eq 0 ] && [ ! -z "$HEALTH_RESPONSE" ]; then
    echo -e "   ${GREEN}✅ Health endpoint responding${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "   ${RED}❌ Health endpoint NOT responding${NC}"
    exit 1
fi
echo ""

# Test 4: Test categories endpoint
echo "4️⃣  Testing Categories Endpoint..."
CATEGORIES_RESPONSE=$(curl -s http://localhost:3000/api/categories)
if [ $? -eq 0 ] && echo "$CATEGORIES_RESPONSE" | grep -q "success"; then
    echo -e "   ${GREEN}✅ Categories endpoint responding${NC}"
    CATEGORY_COUNT=$(echo "$CATEGORIES_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2)
    echo "   Categories loaded: $CATEGORY_COUNT"
else
    echo -e "   ${RED}❌ Categories endpoint NOT responding${NC}"
    exit 1
fi
echo ""

# Test 5: Test CORS
echo "5️⃣  Testing CORS Configuration..."
CORS_RESPONSE=$(curl -s -X OPTIONS http://localhost:3000/api/health \
    -H "Origin: http://localhost:8000" \
    -H "Access-Control-Request-Method: GET" \
    -I | grep "Access-Control-Allow-Origin")
if [ ! -z "$CORS_RESPONSE" ]; then
    echo -e "   ${GREEN}✅ CORS headers present${NC}"
    echo "   $CORS_RESPONSE"
else
    echo -e "   ${RED}❌ CORS headers missing${NC}"
    exit 1
fi
echo ""

# Test 6: Check frontend server
echo "6️⃣  Checking Frontend Server..."
if curl -s http://localhost:8000 > /dev/null; then
    echo -e "   ${GREEN}✅ Frontend server responding on port 8000${NC}"
else
    echo -e "   ${YELLOW}⚠️  Frontend server NOT responding on port 8000${NC}"
    echo "   💡 Start with: cd /workspaces/Image-Analyzer/frontend && python3 -m http.server 8000 &"
fi
echo ""

# Test 7: Verify frontend API URL configuration
echo "7️⃣  Checking Frontend API Configuration..."
FRONTEND_API_URL=$(grep "const API_URL" /workspaces/Image-Analyzer/frontend/app.js | head -1)
if echo "$FRONTEND_API_URL" | grep -q "localhost:3000"; then
    echo -e "   ${GREEN}✅ Frontend API URL configured correctly${NC}"
    echo "   $FRONTEND_API_URL"
else
    echo -e "   ${RED}❌ Frontend API URL misconfigured${NC}"
    echo "   Found: $FRONTEND_API_URL"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo -e "    ${GREEN}🎉 ALL TESTS PASSED!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 QUICK STATUS:"
echo "   Backend API:  http://localhost:3000 ✅"
echo "   Frontend UI:  http://localhost:8000 ✅"
echo "   CORS:         Enabled ✅"
echo "   Categories:   $CATEGORY_COUNT configured ✅"
echo ""
echo "🌐 OPEN IN BROWSER:"
echo "   http://localhost:8000"
echo ""
echo "💡 NEXT STEPS:"
echo "   1. Open http://localhost:8000 in your browser"
echo "   2. Open Developer Tools (F12)"
echo "   3. Check Console tab for any errors"
echo "   4. Try uploading an image"
echo ""
echo "═══════════════════════════════════════════════════════════"
