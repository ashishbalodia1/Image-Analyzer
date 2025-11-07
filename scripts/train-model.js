/**
 * Training Script for City Guardian Image Classifier
 * Trains a CNN model on 500 images per category using transfer learning
 */

const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require('jimp');
const { CATEGORIES, MODEL_CONFIG } = require('../config/categories');

class ModelTrainer {
  constructor() {
    this.baseModel = null;
    this.model = null;
    this.trainingDataPath = process.env.TRAINING_DATA_PATH || './training_data';
  }

  /**
   * Load MobileNet base model for transfer learning
   */
  async loadBaseModel() {
    console.log('📦 Loading MobileNet base model...');
    this.baseModel = await mobilenet.load({
      version: 2,
      alpha: 1.0
    });
    console.log('✅ Base model loaded');
  }

  /**
   * Load and preprocess all training images
   */
  async loadTrainingData() {
    console.log('\n📂 Loading training data...');
    const allImages = [];
    const allLabels = [];

    for (let categoryIndex = 0; categoryIndex < CATEGORIES.length; categoryIndex++) {
      const category = CATEGORIES[categoryIndex];
      const categoryPath = path.join(this.trainingDataPath, category);

      try {
        const files = await fs.readdir(categoryPath);
        const imageFiles = files.filter(f => 
          /\.(jpg|jpeg|png|webp)$/i.test(f)
        );

        console.log(`  📁 ${category}: Found ${imageFiles.length} images`);

        if (imageFiles.length === 0) {
          console.warn(`  ⚠️  Warning: No images found for ${category}`);
          continue;
        }

        // Load up to 500 images per category
        const maxImages = Math.min(imageFiles.length, 500);
        
        for (let i = 0; i < maxImages; i++) {
          const imagePath = path.join(categoryPath, imageFiles[i]);
          
          try {
            const imageBuffer = await fs.readFile(imagePath);
            const processedImage = await this.preprocessImage(imageBuffer);
            
            allImages.push(processedImage);
            allLabels.push(categoryIndex);

            // Progress indicator
            if ((i + 1) % 100 === 0) {
              console.log(`    ⏳ Processed ${i + 1}/${maxImages} images`);
            }
          } catch (error) {
            console.error(`    ❌ Error processing ${imageFiles[i]}: ${error.message}`);
          }
        }

        console.log(`  ✅ Loaded ${maxImages} images for ${category}`);
      } catch (error) {
        console.error(`  ❌ Error loading category ${category}: ${error.message}`);
      }
    }

    console.log(`\n✅ Total images loaded: ${allImages.length}`);
    return { images: allImages, labels: allLabels };
  }

  /**
   * Preprocess image for training
   */
  async preprocessImage(imageBuffer) {
    const image = await Jimp.read(imageBuffer);
    image.resize(MODEL_CONFIG.imageSize, MODEL_CONFIG.imageSize);
    
    const { width, height, data } = image.bitmap;
    const values = new Float32Array(width * height * 3);
    
    let offset = 0;
    for (let i = 0; i < data.length; i += 4) {
      values[offset++] = data[i] / 255;
      values[offset++] = data[i + 1] / 255;
      values[offset++] = data[i + 2] / 255;
    }
    
    return values;
  }

  /**
   * Extract features using MobileNet
   */
  async extractFeatures(images) {
    console.log('\n🔍 Extracting features from images...');
    const features = [];

    for (let i = 0; i < images.length; i++) {
      const tensor = tf.tensor(images[i], [1, MODEL_CONFIG.imageSize, MODEL_CONFIG.imageSize, 3]);
      
      // Get activation from intermediate layer
      const activation = this.baseModel.infer(tensor, 'conv_preds');
      const flattenedActivation = activation.flatten();
      
      features.push(await flattenedActivation.array());
      
      // Clean up
      tensor.dispose();
      activation.dispose();
      flattenedActivation.dispose();

      if ((i + 1) % 100 === 0) {
        console.log(`  ⏳ Extracted features: ${i + 1}/${images.length}`);
      }
    }

    console.log('✅ Feature extraction complete');
    return features;
  }

  /**
   * Build classification model
   */
  buildModel(inputShape) {
    console.log('\n🏗️  Building classification model...');
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 256,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({
          units: 128,
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({
          units: CATEGORIES.length,
          activation: 'softmax'
        })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(MODEL_CONFIG.learningRate),
      loss: 'categoricalCrossentropy',  // Changed from sparseCategoricalCrossentropy
      metrics: ['accuracy']
    });

    console.log('✅ Model built');
    model.summary();
    
    return model;
  }

  /**
   * Train the model
   */
  async train() {
    try {
      console.log('🚀 Starting training process...\n');
      
      // Load base model
      await this.loadBaseModel();
      
      // Load training data
      const { images, labels } = await this.loadTrainingData();
      
      if (images.length === 0) {
        throw new Error('No training data found. Please add images to training_data folder.');
      }

      // Extract features
      const features = await this.extractFeatures(images);
      
      // Convert to tensors
      const featureTensor = tf.tensor2d(features);
      // Convert labels to one-hot encoding for categorical crossentropy
      const labelTensor = tf.oneHot(tf.tensor1d(labels, 'int32'), CATEGORIES.length);
      
      // Build model
      const inputShape = features[0].length;
      this.model = this.buildModel(inputShape);
      
      // Train
      console.log('\n🎓 Training model...');
      const history = await this.model.fit(featureTensor, labelTensor, {
        epochs: MODEL_CONFIG.epochs,
        batchSize: MODEL_CONFIG.batchSize,
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(
              `Epoch ${epoch + 1}/${MODEL_CONFIG.epochs} - ` +
              `Loss: ${logs.loss.toFixed(4)} - ` +
              `Accuracy: ${(logs.acc * 100).toFixed(2)}% - ` +
              `Val Loss: ${logs.val_loss.toFixed(4)} - ` +
              `Val Accuracy: ${(logs.val_acc * 100).toFixed(2)}%`
            );
          }
        }
      });

      // Clean up
      featureTensor.dispose();
      labelTensor.dispose();

      // Save model
      await this.saveModel();
      
      console.log('\n✅ Training complete!');
      console.log(`📊 Final Accuracy: ${(history.history.acc[history.history.acc.length - 1] * 100).toFixed(2)}%`);
      console.log(`📊 Final Val Accuracy: ${(history.history.val_acc[history.history.val_acc.length - 1] * 100).toFixed(2)}%`);

      return history;
    } catch (error) {
      console.error('\n❌ Training failed:', error.message);
      throw error;
    }
  }

  /**
   * Save trained model
   */
  async saveModel() {
    const savePath = path.join(process.cwd(), MODEL_CONFIG.modelPath);
    
    // Create directory if it doesn't exist
    await fs.mkdir(savePath, { recursive: true });
    
    const modelPath = `file://${savePath}`;
    await this.model.save(modelPath);
    
    // Save metadata
    const metadata = {
      categories: CATEGORIES,
      trainedAt: new Date().toISOString(),
      config: MODEL_CONFIG
    };
    
    await fs.writeFile(
      path.join(savePath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`\n💾 Model saved to: ${savePath}`);
  }
}

// Run training if executed directly
if (require.main === module) {
  const trainer = new ModelTrainer();
  trainer.train()
    .then(() => {
      console.log('\n🎉 Training completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Training failed:', error);
      process.exit(1);
    });
}

module.exports = ModelTrainer;
