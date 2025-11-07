/**
 * Test Script for Image Classifier
 * Tests the model with sample images
 */

const fs = require('fs').promises;
const path = require('path');
const classifier = require('../models/classifier');
const { preprocessImage } = require('../utils/imageProcessor');

async function testModel() {
  try {
    console.log('🧪 Testing Image Classifier\n');
    
    // Load model
    console.log('📦 Loading model...');
    const loaded = await classifier.loadModel();
    
    if (!loaded) {
      console.error('❌ Model not found. Please train the model first.');
      console.log('💡 Run: npm run train');
      return;
    }

    console.log('✅ Model loaded successfully\n');

    // Get model info
    const modelInfo = classifier.getModelInfo();
    console.log('📊 Model Information:');
    console.log(`   Categories: ${modelInfo.categories}`);
    console.log(`   Input Shape: ${modelInfo.inputShape}`);
    console.log(`   Output Shape: ${modelInfo.outputShape}\n`);

    // Test with sample images from training data
    const testDataPath = process.env.TRAINING_DATA_PATH || './training_data';
    
    console.log('🔍 Testing with sample images...\n');

    // Get first category
    const categories = await fs.readdir(testDataPath);
    
    for (const category of categories.slice(0, 3)) { // Test first 3 categories
      const categoryPath = path.join(testDataPath, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
        
        if (imageFiles.length === 0) continue;

        // Test first image from category
        const testImagePath = path.join(categoryPath, imageFiles[0]);
        const imageBuffer = await fs.readFile(testImagePath);
        
        console.log(`📸 Testing: ${category}/${imageFiles[0]}`);
        
        // Preprocess and classify
        const preprocessed = await preprocessImage(imageBuffer);
        const result = await classifier.classify(preprocessed);
        
        console.log(`   Predicted: ${result.label}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(2)}%`);
        console.log(`   Correct: ${result.category === category ? '✅' : '❌'}`);
        console.log(`   Top 3 predictions:`);
        
        result.allPredictions.slice(0, 3).forEach((pred, idx) => {
          console.log(`      ${idx + 1}. ${pred.label}: ${(pred.confidence * 100).toFixed(2)}%`);
        });
        
        console.log();
      } catch (error) {
        console.error(`   ❌ Error testing ${category}:`, error.message);
      }
    }

    console.log('✅ Testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run test
testModel();
