# शुरुआत करने की गाइड (Getting Started Guide - Hindi)

## 🏙️ सिटी गार्डियन इमेज एनालाइज़र

यह एक AI-आधारित सिस्टम है जो नागरिकों द्वारा अपलोड की गई समस्याओं की तस्वीरों को स्वचालित रूप से 9 श्रेणियों में वर्गीकृत करता है।

## 📋 श्रेणियाँ (Categories)

1. **मिट्टी प्रदूषण (Soil Pollution)** - भूमि प्रदूषण, कचरे के ढेर
2. **जल प्रदूषण (Water Pollution)** - प्रदूषित नदियाँ, तालाब
3. **सीवेज प्रदूषण (Water Sewage)** - सीवर ओवरफ्लो, नालियों की समस्याएं
4. **वायु प्रदूषण (Air Pollution)** - धुआं, धूल, उत्सर्जन
5. **घर-घर सफाई (Door to Door Cleaning)** - घरेलू कचरा संग्रह
6. **मोहल्ला सफाई (Mohallah Cleaning)** - गली-मोहल्ले की सफाई
7. **सड़क रखरखाव (Road Maintenance)** - गड्ढे, टूटी सड़कें
8. **बुनियादी ढांचा (Infrastructure)** - सार्वजनिक सुविधाएं, स्ट्रीट लाइट
9. **अन्य (Others)** - अन्य नागरिक समस्याएं

## 🚀 सेटअप कैसे करें

### चरण 1: इंस्टॉल करें
```bash
npm install
./setup.sh
cp .env.example .env
```

### चरण 2: ट्रेनिंग डेटा तैयार करें
```bash
# training_data/ फ़ोल्डर में हर श्रेणी के लिए 500 तस्वीरें जोड़ें
# कुल 4,500 तस्वीरें चाहिए

# उदाहरण:
# training_data/soil_pollution/      → 500 तस्वीरें
# training_data/water_pollution/     → 500 तस्वीरें
# और इसी तरह...
```

### चरण 3: मॉडल ट्रेन करें
```bash
npm run train
# यह 20-30 मिनट लगेगा
```

### चरण 4: टेस्ट करें
```bash
npm run test
# मॉडल की सटीकता जांचें
```

### चरण 5: सर्वर चालू करें
```bash
npm start
# API http://localhost:3000 पर उपलब्ध होगी
```

## 📸 तस्वीरें कैसे इकट्ठा करें

### अच्छी तस्वीरों के लिए सुझाव:
- ✅ साफ और फोकस्ड तस्वीरें
- ✅ अच्छी रोशनी में ली गई
- ✅ समस्या स्पष्ट रूप से दिखाई दे
- ✅ विभिन्न कोणों से
- ✅ अलग-अलग समय पर ली गई

### कहाँ से लें:
1. **Google Images** - "sewage overflow India", "pothole road" जैसे शब्द खोजें
2. **अपने शहर से** - खुद जाकर तस्वीरें लें
3. **नागरिकों से** - City Guardian के मौजूदा सबमिशन का उपयोग करें

## 🔧 City Guardian वेबसाइट से कैसे जोड़ें

### JavaScript में:
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
    console.log('श्रेणी:', result.result.label);
    console.log('विश्वास स्तर:', result.result.confidence);
    
    // अब इस श्रेणी को अपने फॉर्म में ऑटो-भरें
    document.getElementById('category').value = result.result.category;
  }
  
  return result;
}
```

## 📡 API का उपयोग कैसे करें

### 1. स्वास्थ्य जांच
```bash
curl http://localhost:3000/api/health
```

### 2. सभी श्रेणियाँ देखें
```bash
curl http://localhost:3000/api/categories
```

### 3. तस्वीर का विश्लेषण करें
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "image=@/path/to/photo.jpg"
```

## 🌐 Vercel पर Deploy कैसे करें

### चरण 1: GitHub पर अपलोड करें
```bash
git add .
git commit -m "AI model added"
git push origin main
```

### चरण 2: Vercel पर जाएं
1. [vercel.com](https://vercel.com) पर जाएं
2. "New Project" पर क्लिक करें
3. अपना GitHub repository चुनें
4. "Deploy" पर क्लिक करें

### चरण 3: Environment Variables जोड़ें
Vercel Dashboard में जाकर ये variables जोड़ें:
```
NODE_ENV=production
CONFIDENCE_THRESHOLD=0.6
ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app
```

## 📊 परिणाम कैसा दिखेगा

```json
{
  "success": true,
  "result": {
    "category": "road_maintenance",
    "label": "Road Maintenance",
    "confidence": "95.50%",
    "description": "Potholes, damaged roads, broken pavements"
  }
}
```

## 🎯 महत्वपूर्ण बातें

1. **डेटा की गुणवत्ता**: अच्छे परिणाम के लिए अच्छी तस्वीरें जरूरी हैं
2. **संतुलन**: हर श्रेणी में बराबर तस्वीरें रखें (500 प्रत्येक)
3. **विविधता**: विभिन्न शहरों, क्षेत्रों की तस्वीरें शामिल करें
4. **अपडेट**: समय-समय पर नई तस्वीरों से मॉडल को फिर से ट्रेन करें

## 🆘 समस्या समाधान

### मॉडल लोड नहीं हो रहा
```bash
npm run train
# पहले मॉडल ट्रेन करें
```

### CORS Error आ रहा है
```bash
# .env फ़ाइल में ALLOWED_ORIGINS अपडेट करें
ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app
```

### सटीकता कम है
- ज्यादा और विविध तस्वीरें जोड़ें
- सभी श्रेणियों में बराबर तस्वीरें रखें
- तस्वीरों की गुणवत्ता बेहतर करें

## 📚 अधिक जानकारी के लिए

- **पूरा डॉक्यूमेंटेशन**: README.md देखें
- **डेटा तैयारी**: DATASET_GUIDE.md देखें
- **Deployment**: DEPLOYMENT.md देखें
- **त्वरित संदर्भ**: QUICK_REFERENCE.md देखें

## 🎓 सीखने के संसाधन

- **TensorFlow.js**: https://www.tensorflow.org/js
- **Express.js**: https://expressjs.com
- **Vercel**: https://vercel.com/docs

## 💪 योगदान करें

अगर आप इस प्रोजेक्ट में योगदान देना चाहते हैं:
1. Fork करें
2. अपनी Branch बनाएं
3. Changes करें
4. Pull Request भेजें

## 📞 सहायता

समस्या या सवाल के लिए:
- GitHub पर Issue खोलें
- README.md देखें
- Examples देखें

---

**स्वच्छ और स्मार्ट शहरों के लिए बनाया गया! 🇮🇳**
