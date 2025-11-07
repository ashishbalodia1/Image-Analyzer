# 🏙️ City Guardian Image Analyzer

AI-powered image classification system for categorizing citizen-uploaded problem images on the City Guardian platform. This system automatically categorizes civic issues into 9 different categories using deep learning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashishbalodia1/Image-Analyzer)

## 🎯 Features

- **9 Category Classification**: Automatically categorizes civic issues
  - Soil Pollution
  - Water Pollution
  - Water Sewage Pollution
  - Air Pollution
  - Door to Door Cleaning
  - Mohallah Cleaning
  - Road Maintenance
  - Infrastructure Issues
  - Others

- **High Accuracy**: Uses MobileNet transfer learning for accurate predictions
- **Fast Processing**: Optimized for serverless deployment on Vercel
- **RESTful API**: Easy integration with existing City Guardian frontend
- **Confidence Scoring**: Returns confidence levels for predictions
- **Batch Processing**: Support for multiple image analysis
- **CORS Enabled**: Ready for production deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- 4,500 images (500 per category) for training

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ashishbalodia1/Image-Analyzer.git
cd Image-Analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Prepare training data**
```bash
# Create directory structure
mkdir -p training_data/{soil_pollution,water_pollution,water_sewage_pollution,air_pollution,door_to_door_cleaning,mohallah_cleaning,road_maintenance,infrastructure,others}

# Add 500 images to each category folder
# See DATASET_GUIDE.md for detailed instructions
```

5. **Train the model**
```bash
npm run train
```

6. **Test the model**
```bash
npm run test
```

7. **Start the server**
```bash
npm start
# or for development
npm run dev
```

## 📡 API Documentation

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T10:30:00.000Z",
  "model": {
    "loaded": true,
    "categories": 9
  }
}
```

#### 2. Get Categories
```http
GET /api/categories
```

**Response:**
```json
{
  "success": true,
  "count": 9,
  "categories": [
    {
      "id": "soil_pollution",
      "label": "Soil Pollution",
      "description": "Issues related to land pollution, garbage dumps..."
    }
  ]
}
```

#### 3. Analyze Single Image
```http
POST /api/analyze
Content-Type: multipart/form-data

Body:
- image: (file)
```

**Response:**
```json
{
  "success": true,
  "requestId": "uuid-here",
  "result": {
    "category": "road_maintenance",
    "label": "Road Maintenance",
    "confidence": "95.50%",
    "confidenceScore": 0.955,
    "needsManualReview": false,
    "description": "Potholes, damaged roads, broken pavements"
  },
  "alternativePredictions": [
    {
      "category": "infrastructure",
      "label": "Infrastructure Issues",
      "confidence": "3.20%"
    }
  ],
  "imageInfo": {
    "width": 1920,
    "height": 1080,
    "format": "image/jpeg"
  },
  "processingTime": "245ms",
  "timestamp": "2025-11-07T10:30:00.000Z"
}
```

#### 4. Batch Analysis
```http
POST /api/analyze/batch
Content-Type: multipart/form-data

Body:
- images: (multiple files)
```

**Response:**
```json
{
  "success": true,
  "requestId": "uuid-here",
  "totalImages": 5,
  "results": [
    {
      "filename": "image1.jpg",
      "success": true,
      "category": "water_pollution",
      "label": "Water Pollution",
      "confidence": "92.30%"
    }
  ]
}
```

## 🔧 Integration with City Guardian Frontend

### JavaScript/React Example

```javascript
async function analyzeImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('https://your-api.vercel.app/api/analyze', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Category:', result.result.label);
    console.log('Confidence:', result.result.confidence);
  }
  
  return result;
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await analyzeImage(file);
  // Handle result
});
```

### cURL Example

```bash
curl -X POST https://your-api.vercel.app/api/analyze \
  -F "image=@/path/to/image.jpg"
```

## 📦 Deployment on Vercel

### Automatic Deployment

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy!

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Environment Variables on Vercel

Add these in Vercel dashboard → Settings → Environment Variables:

```
NODE_ENV=production
CONFIDENCE_THRESHOLD=0.6
ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app
```

### Important: Upload Trained Model

**Note**: You must upload your trained model to Vercel. The training process happens locally, then you deploy the trained model.

1. Train model locally: `npm run train`
2. Commit model files: `git add models/`
3. Push to GitHub: `git push`
4. Vercel will deploy with the trained model

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Manual Testing with Postman
1. Open Postman
2. Create POST request to `http://localhost:3000/api/analyze`
3. Set Body → form-data
4. Add key: `image`, type: File
5. Select an image
6. Send request

## 📊 Model Training Details

### Architecture
- **Base Model**: MobileNetV2 (pre-trained on ImageNet)
- **Transfer Learning**: Custom classification head
- **Input Size**: 224x224x3
- **Output**: 9 categories (softmax)

### Training Configuration
- **Epochs**: 50 (configurable)
- **Batch Size**: 32
- **Learning Rate**: 0.001
- **Optimizer**: Adam
- **Loss**: Sparse Categorical Crossentropy
- **Validation Split**: 20%

### Dataset Requirements
- 500 images per category
- Total: 4,500 images
- Formats: JPEG, PNG, WebP
- Min resolution: 224x224

See [DATASET_GUIDE.md](./DATASET_GUIDE.md) for detailed dataset preparation instructions.

## 🏗️ Project Structure

```
Image-Analyzer/
├── api/
│   └── index.js              # Express API server
├── config/
│   └── categories.js         # Category definitions
├── models/
│   ├── classifier.js         # Model loader and predictor
│   └── city-guardian-classifier/  # Trained model (after training)
│       ├── model.json
│       ├── weights.bin
│       └── metadata.json
├── scripts/
│   ├── train-model.js        # Training script
│   └── test-model.js         # Testing script
├── utils/
│   └── imageProcessor.js     # Image preprocessing utilities
├── training_data/            # Training images (not in repo)
│   ├── soil_pollution/
│   ├── water_pollution/
│   └── ...
├── .env.example              # Environment variables template
├── .gitignore
├── DATASET_GUIDE.md          # Dataset preparation guide
├── package.json
├── README.md
└── vercel.json               # Vercel deployment config
```

## 🔒 Security

- File size limits (10MB)
- MIME type validation
- CORS configuration
- Input sanitization
- Rate limiting (add if needed)

## ⚡ Performance

- Average processing time: ~200-300ms per image
- Supports concurrent requests
- Optimized for serverless
- Automatic memory management

## 🐛 Troubleshooting

### Model not loading
```bash
# Ensure model is trained
npm run train

# Check model files exist
ls -la models/city-guardian-classifier/
```

### CORS errors
```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app,http://localhost:3000
```

### Memory issues during training
```bash
# Reduce batch size in .env
BATCH_SIZE=16
```

### Low accuracy
- Add more diverse training images
- Balance dataset (equal images per category)
- Increase epochs
- Check image quality

## 📈 Future Enhancements

- [ ] Add image storage (S3/Cloudinary)
- [ ] Implement caching for faster responses
- [ ] Add user feedback loop for model improvement
- [ ] Multi-language support
- [ ] Real-time classification via WebSocket
- [ ] Mobile app integration
- [ ] Advanced analytics dashboard
- [ ] Automated model retraining pipeline

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

**City Guardian Development Team**
- Developer: Ashish Balodia
- Contact: [GitHub](https://github.com/ashishbalodia1)

## 🙏 Acknowledgments

- TensorFlow.js team
- MobileNet creators
- City Guardian community
- All contributors

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@cityguardian.com (if applicable)
- Documentation: See DATASET_GUIDE.md

---

**Made with ❤️ for cleaner, smarter cities**
