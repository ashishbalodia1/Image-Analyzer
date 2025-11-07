/**
 * Express API Server for City Guardian Image Analyzer
 * Main entry point for the API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');

const classifier = require('../models/classifier');
const { validateImage, preprocessImage, getImageMetadata } = require('../utils/imageProcessor');
const { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS } = require('../config/categories');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS Configuration
// In development, allow all origins. In production, restrict to specific origins.
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://cityguardian-frontend.vercel.app').split(',');
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  // Development: Allow all origins
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the 10MB limit'
}));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const modelInfo = classifier.getModelInfo();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    model: modelInfo,
    categories: Object.keys(CATEGORY_LABELS).length
  });
});

/**
 * Get all categories
 */
app.get('/api/categories', (req, res) => {
  const categories = Object.keys(CATEGORY_LABELS).map(key => ({
    id: key,
    label: CATEGORY_LABELS[key],
    description: CATEGORY_DESCRIPTIONS[key]
  }));

  res.json({
    success: true,
    count: categories.length,
    categories
  });
});

/**
 * Image analysis endpoint
 */
app.post('/api/analyze', async (req, res) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  try {
    // Check if file exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded',
        message: 'Please upload an image file with the key "image"'
      });
    }

    const imageFile = req.files.image;

    // Validate image
    const validation = validateImage(imageFile);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image',
        details: validation.errors
      });
    }

    // Get image metadata
    const metadata = await getImageMetadata(imageFile.data);

    // Preprocess image
    const preprocessedImage = await preprocessImage(imageFile.data);

    // Classify image
    const prediction = await classifier.classify(preprocessedImage);

    const processingTime = Date.now() - startTime;

    // Send response
    res.json({
      success: true,
      requestId,
      result: {
        category: prediction.category,
        label: prediction.label,
        confidence: (prediction.confidence * 100).toFixed(2) + '%',
        confidenceScore: prediction.confidence,
        needsManualReview: prediction.needsManualReview,
        description: CATEGORY_DESCRIPTIONS[prediction.category]
      },
      alternativePredictions: prediction.allPredictions.slice(0, 3).map(p => ({
        category: p.category,
        label: p.label,
        confidence: (p.confidence * 100).toFixed(2) + '%',
        confidenceScore: p.confidence
      })),
      imageInfo: {
        originalSize: metadata.size,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      },
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    
    res.status(500).json({
      success: false,
      requestId,
      error: 'Analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Batch analysis endpoint (for multiple images)
 */
app.post('/api/analyze/batch', async (req, res) => {
  const requestId = uuidv4();

  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        error: 'No images uploaded',
        message: 'Please upload images with the key "images"'
      });
    }

    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const results = [];

    for (const imageFile of images) {
      try {
        const validation = validateImage(imageFile);
        if (!validation.valid) {
          results.push({
            filename: imageFile.name,
            success: false,
            error: validation.errors
          });
          continue;
        }

        const preprocessedImage = await preprocessImage(imageFile.data);
        const prediction = await classifier.classify(preprocessedImage);

        results.push({
          filename: imageFile.name,
          success: true,
          category: prediction.category,
          label: prediction.label,
          confidence: (prediction.confidence * 100).toFixed(2) + '%',
          needsManualReview: prediction.needsManualReview
        });
      } catch (error) {
        results.push({
          filename: imageFile.name,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      requestId,
      totalImages: images.length,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] Batch error:`, error);
    
    res.status(500).json({
      success: false,
      requestId,
      error: 'Batch analysis failed',
      message: error.message
    });
  }
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/categories',
      'POST /api/analyze',
      'POST /api/analyze/batch'
    ]
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

/**
 * Initialize and start server
 */
async function startServer() {
  try {
    console.log('🚀 City Guardian Image Analyzer API');
    console.log('=====================================\n');
    
    // Load model
    const modelLoaded = await classifier.loadModel();
    
    if (!modelLoaded) {
      console.warn('⚠️  Model not loaded. API will run but analysis will fail.');
      console.warn('💡 Please run "npm run train" to train the model first.\n');
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API endpoints available at http://localhost:${PORT}/api/`);
      console.log('\n🔗 Available endpoints:');
      console.log('   GET  /api/health');
      console.log('   GET  /api/categories');
      console.log('   POST /api/analyze');
      console.log('   POST /api/analyze/batch\n');
    });

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if run directly
if (require.main === module) {
  startServer();
}

// Export for Vercel serverless
module.exports = app;
