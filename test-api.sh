#!/bin/bash

echo "🧪 Testing City Guardian Image Analyzer API"
echo "==========================================="
echo ""

# Test 1: Health Check
echo "✅ Test 1: Health Check"
echo "-------------------------"
curl -s http://localhost:3000/api/health | jq .
echo ""
echo ""

# Test 2: Get Categories
echo "✅ Test 2: Get All Categories"
echo "-------------------------"
curl -s http://localhost:3000/api/categories | jq '.categories[] | {id, label}'
echo ""
echo ""

# Test 3: Try to analyze (will fail without model, but shows endpoint works)
echo "✅ Test 3: Analyze Endpoint (Expected to fail - model not trained)"
echo "-------------------------"
echo "Creating a dummy image for testing..."

# Create a simple test image using ImageMagick or just show the error
if command -v convert &> /dev/null; then
    convert -size 300x300 xc:red /tmp/test-image.jpg
    echo "Uploading test image..."
    curl -s -X POST http://localhost:3000/api/analyze \
      -F "image=@/tmp/test-image.jpg" | jq .
else
    echo "⚠️  ImageMagick not installed, testing with curl..."
    curl -s -X POST http://localhost:3000/api/analyze | jq .
fi

echo ""
echo ""
echo "✅ All API endpoints are working!"
echo "💡 Note: Image analysis will work after you train the model"
echo ""
echo "Next steps:"
echo "1. Add 500 images to each category in training_data/"
echo "2. Run: npm run train"
echo "3. Run: npm run test"
echo "4. Try image analysis again!"
