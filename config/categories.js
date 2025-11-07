/**
 * City Guardian Image Analyzer - Configuration
 * Defines all categories and model settings
 */

const CATEGORIES = [
  'soil_pollution',
  'water_pollution',
  'water_sewage_pollution',
  'air_pollution',
  'door_to_door_cleaning',
  'mohallah_cleaning',
  'road_maintenance',
  'infrastructure',
  'others'
];

const CATEGORY_LABELS = {
  soil_pollution: 'Soil Pollution',
  water_pollution: 'Water Pollution',
  water_sewage_pollution: 'Water Sewage Pollution',
  air_pollution: 'Air Pollution',
  door_to_door_cleaning: 'Door to Door Cleaning',
  mohallah_cleaning: 'Mohallah Cleaning',
  road_maintenance: 'Road Maintenance',
  infrastructure: 'Infrastructure Issues',
  others: 'Other Issues'
};

const CATEGORY_DESCRIPTIONS = {
  soil_pollution: 'Issues related to land pollution, garbage dumps, soil contamination',
  water_pollution: 'Contaminated water bodies, polluted rivers, lakes',
  water_sewage_pollution: 'Sewage overflow, drainage issues, wastewater problems',
  air_pollution: 'Smoke, dust, industrial emissions, burning waste',
  door_to_door_cleaning: 'Household waste collection issues',
  mohallah_cleaning: 'Street and neighborhood cleanliness problems',
  road_maintenance: 'Potholes, damaged roads, broken pavements',
  infrastructure: 'Building issues, street lights, public facilities',
  others: 'Other civic issues not categorized above'
};

const MODEL_CONFIG = {
  imageSize: 224,
  confidenceThreshold: parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.6,
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,image/webp').split(','),
  modelPath: process.env.MODEL_PATH || './models/city-guardian-classifier',
  epochs: parseInt(process.env.EPOCHS) || 50,
  batchSize: parseInt(process.env.BATCH_SIZE) || 32,
  learningRate: parseFloat(process.env.LEARNING_RATE) || 0.001
};

module.exports = {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  MODEL_CONFIG
};
