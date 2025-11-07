/**
 * Image Preprocessing Utilities
 * Handles image validation, resizing, and preprocessing for model input
 */

const Jimp = require('jimp');
const { MODEL_CONFIG } = require('../config/categories');

/**
 * Validate uploaded image file
 */
function validateImage(file) {
  const errors = [];

  if (!file) {
    errors.push('No file uploaded');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > MODEL_CONFIG.maxFileSize) {
    errors.push(`File size exceeds ${MODEL_CONFIG.maxFileSize / (1024 * 1024)}MB limit`);
  }

  // Check mime type
  if (!MODEL_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${MODEL_CONFIG.allowedMimeTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Preprocess image for model input
 * Resize to 224x224 and normalize pixel values
 */
async function preprocessImage(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer);
    
    // Resize to model input size (224x224)
    image.resize(MODEL_CONFIG.imageSize, MODEL_CONFIG.imageSize);
    
    // Convert to bitmap
    const bitmap = image.bitmap;
    const { width, height, data } = bitmap;
    
    // Create tensor-ready array [224, 224, 3]
    const values = new Float32Array(width * height * 3);
    
    let offset = 0;
    for (let i = 0; i < data.length; i += 4) {
      // Normalize RGB values to [0, 1]
      values[offset++] = data[i] / 255;       // R
      values[offset++] = data[i + 1] / 255;   // G
      values[offset++] = data[i + 2] / 255;   // B
    }
    
    return {
      data: values,
      shape: [1, width, height, 3]
    };
  } catch (error) {
    throw new Error(`Image preprocessing failed: ${error.message}`);
  }
}

/**
 * Extract image metadata
 */
async function getImageMetadata(imageBuffer) {
  try {
    const image = await Jimp.read(imageBuffer);
    return {
      width: image.bitmap.width,
      height: image.bitmap.height,
      size: imageBuffer.length,
      format: image.getMIME()
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error.message}`);
  }
}

/**
 * Create thumbnail for storage (optional)
 */
async function createThumbnail(imageBuffer, size = 150) {
  try {
    const image = await Jimp.read(imageBuffer);
    image.resize(size, size);
    return await image.getBufferAsync(Jimp.MIME_JPEG);
  } catch (error) {
    throw new Error(`Thumbnail creation failed: ${error.message}`);
  }
}

module.exports = {
  validateImage,
  preprocessImage,
  getImageMetadata,
  createThumbnail
};
