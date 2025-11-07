#!/bin/bash

# City Guardian Image Analyzer - Stop Servers Script

echo "🛑 Stopping City Guardian Image Analyzer servers..."
echo ""

# Kill backend server (port 3000)
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   Stopping backend (port 3000)..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    echo "   ✅ Backend stopped"
else
    echo "   ℹ️  No backend server running on port 3000"
fi

# Kill frontend server (port 8000)
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "   Stopping frontend (port 8000)..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo "   ✅ Frontend stopped"
else
    echo "   ℹ️  No frontend server running on port 8000"
fi

echo ""
echo "✅ All servers stopped!"
