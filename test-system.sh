#!/bin/bash

# City Guardian Image Analyzer - Quick Test Script
# Run this to quickly verify everything is working

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🧪 City Guardian - Quick Test Suite              ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Test function
run_test() {
    TEST_NAME=$1
    TEST_COMMAND=$2
    EXPECTED_PATTERN=$3
    
    echo -n "Testing: $TEST_NAME ... "
    
    RESULT=$(eval $TEST_COMMAND 2>&1)
    
    if echo "$RESULT" | grep -q "$EXPECTED_PATTERN"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo -e "${YELLOW}   Expected pattern: $EXPECTED_PATTERN${NC}"
        echo -e "${YELLOW}   Got: $RESULT${NC}"
        ((FAILED++))
    fi
}

echo "Running tests..."
echo ""

# Test 1: Check if backend process is running
run_test "Backend Process" "ps aux | grep 'node.*api/index.js' | grep -v grep" "node.*api/index"

# Test 2: Check if backend responds
run_test "Backend Health" "curl -s http://localhost:3000/api/health" "healthy"

# Test 3: Check if categories endpoint works
run_test "Categories API" "curl -s http://localhost:3000/api/categories" "success"

# Test 4: Check category count
run_test "Category Count" "curl -s http://localhost:3000/api/categories | grep -o '\"count\":[0-9]*' | cut -d':' -f2" "9"

# Test 5: Check if frontend process is running
run_test "Frontend Process" "lsof -i:8000 | grep LISTEN" "LISTEN"

# Test 6: Check if frontend serves HTML
run_test "Frontend Serving" "curl -s http://localhost:8000 | head -5" "<!DOCTYPE html>"

# Test 7: Check CORS headers
run_test "CORS Headers" "curl -s -I http://localhost:3000/api/health -H 'Origin: http://localhost:8000'" "Access-Control-Allow-Origin"

# Test 8: Check if ports are open
run_test "Port 3000 Open" "lsof -i:3000" "3000"
run_test "Port 8000 Open" "lsof -i:8000" "8000"

# Test 9: Check response time
START_TIME=$(date +%s%N)
curl -s http://localhost:3000/api/health > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( ($END_TIME - $START_TIME) / 1000000 ))
echo -n "Testing: Response Time ... "
if [ $RESPONSE_TIME -lt 1000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${RESPONSE_TIME}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${RESPONSE_TIME}ms - expected < 1000ms)"
    ((PASSED++))
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                     TEST RESULTS                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "   ${GREEN}Passed: $PASSED${NC}"
echo -e "   ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🌐 System is ready to use:"
    
    if [ ! -z "$CODESPACE_NAME" ]; then
        echo "   Frontend: https://$CODESPACE_NAME-8000.app.github.dev"
        echo "   Backend:  https://$CODESPACE_NAME-3000.app.github.dev/api/health"
    else
        echo "   Frontend: http://localhost:8000"
        echo "   Backend:  http://localhost:3000/api/health"
    fi
    
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "   1. Run: ./start.sh"
    echo "   2. Check logs: tail -f logs/backend.log"
    echo "   3. See CODESPACES_FIX.md for help"
    exit 1
fi
