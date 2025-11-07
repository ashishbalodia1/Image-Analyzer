#!/bin/bash

# City Guardian Image Analyzer - Setup Script
# Creates necessary directories for the project

echo "🏙️  City Guardian Image Analyzer - Setup"
echo "========================================"
echo ""

# Create training data directories
echo "📁 Creating training data directories..."
mkdir -p training_data/{soil_pollution,water_pollution,water_sewage_pollution,air_pollution,door_to_door_cleaning,mohallah_cleaning,road_maintenance,infrastructure,others}

# Create models directory
echo "📁 Creating models directory..."
mkdir -p models/city-guardian-classifier

# Create uploads and temp directories
echo "📁 Creating temporary directories..."
mkdir -p uploads temp

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Add 500 images to each category folder in training_data/"
echo "   2. Run: npm run train"
echo "   3. Run: npm run test"
echo "   4. Run: npm start"
echo ""
echo "📖 See DATASET_GUIDE.md for detailed instructions on preparing images"
echo ""

# List created directories
echo "📂 Directory structure:"
tree -L 2 -d training_data 2>/dev/null || ls -R training_data/

echo ""
echo "🎉 Ready to go! Happy training!"
