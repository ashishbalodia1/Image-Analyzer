/**
 * TensorFlow.js Model Handler
 * Loads and runs the trained image classification model
 */

const tf = require('@tensorflow/tfjs-node');
const fs = require('fs').promises;
const path = require('path');
const { CATEGORIES, CATEGORY_LABELS, MODEL_CONFIG } = require('../config/categories');

class ImageClassifier {
  constructor() {
    this.model = null;
    this.isReady = false;
  }

  /**
   * Load the trained model
   */
  async loadModel() {
    try {
      const modelPath = path.join(process.cwd(), MODEL_CONFIG.modelPath, 'model.json');
      
      // Check if model exists
      try {
        await fs.access(modelPath);
      } catch (error) {
        console.warn('⚠️  Trained model not found. Please run training first.');
        console.warn('📝 Using fallback placeholder until model is trained.');
        return false;
      }

      this.model = await tf.loadLayersModel(`file://${modelPath}`);
      this.isReady = true;
      console.log('✅ Model loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ Error loading model:', error.message);
      return false;
    }
  }

  /**
   * Classify an image
   */
  async classify(preprocessedImage) {
    if (!this.isReady || !this.model) {
      throw new Error('Model not loaded. Please train the model first.');
    }

    try {
      // Create tensor from preprocessed image
      const tensor = tf.tensor(preprocessedImage.data, preprocessedImage.shape);
      
      // Run prediction
      const predictions = await this.model.predict(tensor);
      const predictionData = await predictions.data();
      
      // Clean up tensors
      tensor.dispose();
      predictions.dispose();
      
      // Map predictions to categories
      const results = CATEGORIES.map((category, index) => ({
        category,
        label: CATEGORY_LABELS[category],
        confidence: predictionData[index]
      }));
      
      // Sort by confidence (highest first)
      results.sort((a, b) => b.confidence - a.confidence);
      
      // Get top prediction
      const topPrediction = results[0];
      
      // If confidence is below threshold, mark as "others"
      if (topPrediction.confidence < MODEL_CONFIG.confidenceThreshold) {
        return {
          category: 'others',
          label: CATEGORY_LABELS.others,
          confidence: topPrediction.confidence,
          allPredictions: results,
          needsManualReview: true
        };
      }
      
      return {
        category: topPrediction.category,
        label: topPrediction.label,
        confidence: topPrediction.confidence,
        allPredictions: results,
        needsManualReview: false
      };
    } catch (error) {
      throw new Error(`Classification failed: ${error.message}`);
    }
  }

  /**
   * Get model info
   */
  getModelInfo() {
    if (!this.isReady || !this.model) {
      return {
        loaded: false,
        message: 'Model not loaded'
      };
    }

    return {
      loaded: true,
      categories: CATEGORIES.length,
      categoryList: CATEGORY_LABELS,
      inputShape: this.model.inputs[0].shape,
      outputShape: this.model.outputs[0].shape
    };
  }
}

// Singleton instance
const classifier = new ImageClassifier();

module.exports = classifier;
