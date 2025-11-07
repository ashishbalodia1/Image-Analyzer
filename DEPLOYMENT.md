# Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Trained model files

## Step-by-Step Deployment

### 1. Prepare Your Model

First, train your model locally with your dataset:

```bash
# Ensure you have 500 images per category in training_data/
npm run train

# This will create model files in models/city-guardian-classifier/
```

### 2. Commit Model Files to Git

**Important**: The model files need to be in your repository.

```bash
# Add model files to git (they're needed for deployment)
git add models/city-guardian-classifier/

# Also commit all other files
git add .
git commit -m "Add trained image classification model"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   CONFIDENCE_THRESHOLD=0.6
   ALLOWED_ORIGINS=https://cityguardian-frontend.vercel.app
   ```

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 4. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `CONFIDENCE_THRESHOLD` | `0.6` | Minimum confidence for predictions |
| `ALLOWED_ORIGINS` | `https://cityguardian-frontend.vercel.app` | CORS allowed origins |
| `MAX_FILE_SIZE` | `10485760` | Max upload size (10MB) |

### 5. Test Your Deployment

```bash
# Replace with your actual Vercel URL
curl https://your-app.vercel.app/api/health

# Test image analysis
curl -X POST https://your-app.vercel.app/api/analyze \
  -F "image=@test-image.jpg"
```

### 6. Update City Guardian Frontend

Update your frontend to use the new API URL:

```javascript
// In your frontend code
const API_URL = 'https://your-app.vercel.app';

// Use the API
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch(`${API_URL}/api/analyze`, {
  method: 'POST',
  body: formData
});
```

## Important Notes

### Model File Size

If your model is too large (>100MB), Vercel has size limits. Solutions:

1. **Use Model Compression**:
   ```javascript
   // Add to training script
   await model.save(modelPath, {
     includeOptimizer: false // Reduces size
   });
   ```

2. **Host Model Externally**:
   - Upload model to AWS S3 or Google Cloud Storage
   - Download model on first API call
   - Cache in `/tmp` directory

3. **Use Vercel Pro** for larger deployments

### Cold Start Issues

Serverless functions on Vercel can have cold starts. To minimize:

1. Keep model files small
2. Use caching where possible
3. Consider keeping a "warm" instance with periodic health checks

### Serverless Function Timeout

Vercel has a 10s timeout on hobby plan (60s on Pro). If needed:

```json
// vercel.json
{
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

## Continuous Deployment

Once set up, every push to `main` branch automatically deploys:

```bash
# Make changes
git add .
git commit -m "Update model or code"
git push origin main

# Vercel automatically deploys!
```

## Monitoring

### View Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View "Function Logs"

### Check Performance

Monitor in Vercel Dashboard:
- Function invocations
- Response times
- Error rates
- Bandwidth usage

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as shown
4. Update `ALLOWED_ORIGINS` environment variable

## Troubleshooting

### Issue: Model not loading

**Solution**: Ensure model files are committed to git:
```bash
git add models/city-guardian-classifier/
git commit -m "Add model files"
git push
```

### Issue: CORS errors

**Solution**: Check `ALLOWED_ORIGINS` environment variable includes your frontend URL

### Issue: 500 errors

**Solution**: Check Function Logs in Vercel Dashboard for error details

### Issue: Timeout errors

**Solution**: 
- Optimize model size
- Increase timeout in vercel.json
- Consider upgrading to Pro plan

### Issue: Out of memory

**Solution**:
- Reduce model size
- Optimize image preprocessing
- Use smaller batch sizes

## Production Checklist

Before going live:

- [ ] Model trained with sufficient data (500+ images per category)
- [ ] Model tested locally with `npm run test`
- [ ] All environment variables configured
- [ ] CORS properly configured for your frontend
- [ ] Error handling tested
- [ ] API endpoints tested with various inputs
- [ ] Security headers configured
- [ ] Rate limiting considered (if high traffic expected)
- [ ] Monitoring set up
- [ ] Documentation updated with production URL

## Scaling Considerations

If you expect high traffic:

1. **Use CDN**: Vercel automatically uses Edge Network
2. **Implement Caching**: Cache predictions for similar images
3. **Add Rate Limiting**: Prevent abuse
4. **Consider Dedicated Server**: For very high loads, consider AWS/GCP
5. **Monitor Costs**: Check Vercel usage dashboard

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs
- Review function logs in Vercel dashboard
- Test locally first: `npm start`
- Check GitHub issues

## Next Steps After Deployment

1. **Test all endpoints** from your frontend
2. **Monitor performance** for first few days
3. **Collect user feedback** on accuracy
4. **Retrain model** with real-world data
5. **Update documentation** with production URL

---

**Congratulations! Your AI Image Analyzer is now live! 🎉**
