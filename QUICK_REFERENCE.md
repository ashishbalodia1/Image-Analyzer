# Quick Reference Guide

## Common Commands

```bash
# Setup
npm install                    # Install dependencies
./setup.sh                     # Create directory structure
cp .env.example .env          # Create environment file

# Development
npm start                      # Start server (production mode)
npm run dev                    # Start server (development mode)
npm run train                  # Train the model
npm run test                   # Test the model

# Deployment
vercel --prod                  # Deploy to Vercel
git push origin main          # Auto-deploy if connected to Vercel
```

## API Endpoints Quick Reference

### Health Check
```bash
GET /api/health
```

### Get Categories
```bash
GET /api/categories
```

### Analyze Image
```bash
POST /api/analyze
Content-Type: multipart/form-data
Body: image=<file>
```

### Batch Analysis
```bash
POST /api/analyze/batch
Content-Type: multipart/form-data
Body: images=<files>
```

## cURL Examples

```bash
# Health check
curl http://localhost:3000/api/health

# Analyze single image
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@path/to/image.jpg"

# Get categories
curl http://localhost:3000/api/categories
```

## Directory Structure

```
├── api/
│   └── index.js              # Main Express server
├── config/
│   └── categories.js         # Category definitions
├── models/
│   ├── classifier.js         # Classification logic
│   └── city-guardian-classifier/  # Trained model files
├── scripts/
│   ├── train-model.js        # Training script
│   └── test-model.js         # Testing script
├── utils/
│   └── imageProcessor.js     # Image utilities
├── training_data/            # Your images (500 per folder)
│   ├── soil_pollution/
│   ├── water_pollution/
│   ├── water_sewage_pollution/
│   ├── air_pollution/
│   ├── door_to_door_cleaning/
│   ├── mohallah_cleaning/
│   ├── road_maintenance/
│   ├── infrastructure/
│   └── others/
└── examples/                 # Integration examples
```

## Categories

1. **Soil Pollution** - Land contamination, garbage dumps
2. **Water Pollution** - Polluted water bodies, rivers
3. **Water Sewage Pollution** - Sewage overflow, drainage issues
4. **Air Pollution** - Smoke, dust, emissions
5. **Door to Door Cleaning** - Household waste collection
6. **Mohallah Cleaning** - Street cleanliness
7. **Road Maintenance** - Potholes, damaged roads
8. **Infrastructure** - Public facilities, street lights
9. **Others** - Miscellaneous civic issues

## Environment Variables

```env
PORT=3000
NODE_ENV=development
MODEL_PATH=./models/city-guardian-classifier
CONFIDENCE_THRESHOLD=0.6
ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app
MAX_FILE_SIZE=10485760
TRAINING_DATA_PATH=./training_data
EPOCHS=50
BATCH_SIZE=32
LEARNING_RATE=0.001
```

## Response Format

### Success Response
```json
{
  "success": true,
  "requestId": "uuid",
  "result": {
    "category": "road_maintenance",
    "label": "Road Maintenance",
    "confidence": "95.50%",
    "confidenceScore": 0.955,
    "needsManualReview": false,
    "description": "Potholes, damaged roads..."
  },
  "alternativePredictions": [...],
  "imageInfo": {...},
  "processingTime": "245ms"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Integration Code Snippet

```javascript
// Simple integration
async function analyzeImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch('https://your-api.vercel.app/api/analyze', {
    method: 'POST',
    body: formData
  });
  
  return await res.json();
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Model not found | Run `npm run train` |
| CORS error | Update `ALLOWED_ORIGINS` in .env |
| Out of memory | Reduce `BATCH_SIZE` in .env |
| Low accuracy | Add more diverse training images |
| Timeout | Reduce model size or increase timeout |

## Important Files

- `README.md` - Complete documentation
- `DATASET_GUIDE.md` - How to prepare training data
- `DEPLOYMENT.md` - Vercel deployment guide
- `.env.example` - Environment variables template
- `vercel.json` - Vercel configuration

## Workflow

1. **Setup**: Install dependencies and create directories
2. **Prepare Data**: Add 500 images per category
3. **Train**: Run training script
4. **Test**: Verify model accuracy
5. **Deploy**: Push to Vercel
6. **Integrate**: Connect to City Guardian frontend
7. **Monitor**: Track performance and accuracy
8. **Improve**: Retrain with real-world data

## Performance Tips

- Keep images under 5MB
- Use JPEG for photos (smaller size)
- Aim for 640x640 or higher resolution
- Include diverse angles and lighting
- Balance images across categories
- Regularly retrain with new data

## Support Resources

- Documentation: See README.md
- Dataset Guide: See DATASET_GUIDE.md
- Deployment: See DEPLOYMENT.md
- Examples: Check examples/ folder
- Issues: GitHub repository

---

**Need help? Check the full README.md or open an issue on GitHub!**
