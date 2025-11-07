# 🚀 Quick Start Commands - City Guardian Image Analyzer

## 🎯 One-Command Start (RECOMMENDED)

### Start Everything Automatically:
```bash
./start.sh
```
Or:
```bash
npm run start:all
```

**This will:**
- ✅ Install dependencies (if needed)
- ✅ Kill any existing servers
- ✅ Start backend on port 3000
- ✅ Start frontend on port 8000
- ✅ Run connection tests
- ✅ Show access URLs
- ✅ Display logs in real-time

---

## 🧪 Testing Commands

### Quick System Test:
```bash
./test-system.sh
```
Or:
```bash
npm run test:system
```
**Runs 10 tests and shows pass/fail results**

### Full Connection Test:
```bash
./test-frontend-connection.sh
```
Or:
```bash
npm run test:connection
```
**Detailed frontend-backend connection verification**

---

## 🛑 Stop Commands

### Stop All Servers:
```bash
./stop-servers.sh
```
Or:
```bash
npm run stop
```

---

## 📋 Individual Commands

### Backend Only:
```bash
npm start
# or
node api/index.js
```

### Frontend Only:
```bash
cd frontend
python3 -m http.server 8000
```

### Train Model:
```bash
npm run train
# or
EPOCHS=15 BATCH_SIZE=32 npm run train
```

### Test Model:
```bash
npm run test
```

---

## 🌐 Access URLs

### Local Development:
- **Frontend:** http://localhost:8000
- **Backend:** http://localhost:3000/api/health
- **Quick Test:** http://localhost:8000/quick-test.html
- **Diagnostic:** http://localhost:8000/diagnostic.html

### GitHub Codespaces:
- **Frontend:** https://YOUR_CODESPACE_NAME-8000.app.github.dev
- **Backend:** https://YOUR_CODESPACE_NAME-3000.app.github.dev/api/health
- **Quick Test:** https://YOUR_CODESPACE_NAME-8000.app.github.dev/quick-test.html

*(URLs auto-displayed when you run `./start.sh`)*

---

## 📊 Log Files

### View Logs:
```bash
# Backend logs
tail -f logs/backend.log

# Frontend logs
tail -f logs/frontend.log

# Both logs
tail -f logs/*.log
```

---

## 🔧 Troubleshooting

### If ports are in use:
```bash
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Kill port 8000
lsof -ti:8000 | xargs kill -9

# Or use stop script
./stop-servers.sh
```

### If dependencies missing:
```bash
npm install
```

### If still having issues:
```bash
# Run diagnostic
npm run test:system

# Check logs
cat logs/backend.log
cat logs/frontend.log
```

---

## ⚡ Quick Workflow

### Complete Fresh Start:
```bash
# 1. Stop any existing servers
./stop-servers.sh

# 2. Start everything
./start.sh

# 3. Test in browser
# Open the URL shown in the terminal
```

### Development Workflow:
```bash
# Terminal 1: Start servers
./start.sh

# Terminal 2: Test changes
npm run test:system

# Terminal 3: View logs
tail -f logs/backend.log
```

---

## 📱 Browser Testing

After running `./start.sh`, open in browser:

1. **Main App:** Open the frontend URL
2. **Press F12** to open Developer Tools
3. **Console tab** should show: `✅ API Connected`
4. **Try uploading** an image (analysis needs trained model)

---

## 🎓 Training & Deployment

### Train Model:
```bash
# Quick training (10 epochs)
EPOCHS=10 npm run train

# Production training (50 epochs)
EPOCHS=50 BATCH_SIZE=32 npm run train
```

### Deploy to Vercel:
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# Deploy on vercel.com
# Import GitHub repo
# Auto-deploy enabled ✅
```

---

## 💡 Pro Tips

### Run in Background:
```bash
# Start and detach
nohup ./start.sh > logs/startup.log 2>&1 &

# Check if running
npm run test:system
```

### Auto-restart on Changes:
```bash
# Install nodemon
npm install -g nodemon

# Use dev mode
npm run dev
```

### Quick Health Check:
```bash
curl http://localhost:3000/api/health
curl http://localhost:8000
```

---

## 📚 Documentation

- **Full Guide:** [README.md](README.md)
- **Codespaces Fix:** [CODESPACES_FIX.md](CODESPACES_FIX.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Dataset Guide:** [DATASET_GUIDE.md](DATASET_GUIDE.md)

---

## ✨ Most Used Commands

```bash
# Start everything
./start.sh

# Test everything
./test-system.sh

# Stop everything
./stop-servers.sh

# View logs
tail -f logs/*.log
```

---

**Made with ❤️ for City Guardian**
