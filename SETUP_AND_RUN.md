# 🚀 Complete Setup & Running Guide

## MongoDB Connection ✅

Your MongoDB Atlas connection is already configured in `.env`:
```
MONGODB_URI=mongodb+srv://tanzeelaijazofficial_db_user:salam2004@cluster0.cz40dsi.mongodb.net/?appName=Cluster0
```

### Verify Connection
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB Connected!')).catch(err => console.log('Error:', err))"
```

---

## How to Run the Entire Project

You need to run **3 services** in **3 separate terminals**:

### Terminal 1: Backend Server (Node.js + Express)
```bash
# From project root
npm install          # (Only first time)
npm start            # Runs on http://localhost:5000
```

**What it does:**
- Starts Express server
- Connects to MongoDB
- Serves API endpoints for chores, users, rewards, etc.

---

### Terminal 2: Frontend (React)
```bash
# From project root
cd client
npm install          # (Only first time)
npm start            # Runs on http://localhost:3000
```

**What it does:**
- Starts React development server
- Opens browser at http://localhost:3000
- Hot reload on file changes

---

### Terminal 3: ML Service (Python + Flask)
```bash
# From project root
cd ml_service

# Install dependencies (only first time)
pip install flask flask-cors scikit-learn pandas numpy

# Run the service
python app.py        # Runs on http://localhost:5001
```

**What it does:**
- Starts Flask API server
- Provides ML sentiment analysis endpoints
- Used by AI Bot for motivational messages

---

## Complete Step-by-Step (First Time Setup)

### Step 1: Install Node Dependencies (Backend)
```bash
cd c:\Users\User\Documents\kidschorestracker
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 3: Install Python Dependencies
```bash
cd ml_service
pip install flask flask-cors scikit-learn pandas numpy
cd ..
```

### Step 4: Open 3 Terminal Windows

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

**Terminal 3 - ML Service:**
```bash
cd ml_service
python app.py
```

### Step 5: Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **ML Service:** http://localhost:5001

---

## Environment Variables

```env
PORT=5000                                          # Backend port
MONGODB_URI=mongodb+srv://...                      # MongoDB connection
JWT_SECRET=kids_chores_tracker_secret_key_2026     # JWT token secret
GEMINI_API_KEY=AIzaSyB4tSETybbOhMmhWyrRHEKagIWzdYlZxuo  # Google AI API
```

**✅ MongoDB is already configured!**

---

## Quick Commands Reference

### Backend Only
```bash
npm start
```

### Frontend Only
```bash
cd client
npm start
```

### ML Service Only
```bash
cd ml_service
python app.py
```

### Kill All Processes
```bash
# On Windows (PowerShell)
Get-Process node | Stop-Process -Force
taskkill /IM python.exe /F
```

---

## Project Structure Summary

```
kidschorestracker/
├── server/              # Backend (Express.js)
│   ├── server.js       # Main server file
│   ├── config/         # Database config
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Business logic
│   └── routes/         # API endpoints
│
├── client/             # Frontend (React)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Pages
│   │   ├── services/   # API calls
│   │   └── App.js      # Main app
│   └── package.json
│
├── ml_service/         # ML Service (Python)
│   ├── app.py          # Flask app
│   ├── train_model.py  # Training script
│   ├── best_model.pkl  # Trained model
│   └── vectorizer.pkl
│
└── .env                # Configuration
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
- Check `.env` file has correct password
- Verify MongoDB Atlas network access settings
- Add your IP to MongoDB whitelist

### Module Not Found
```bash
# Backend
npm install

# Frontend
cd client
npm install

# ML Service
pip install flask flask-cors scikit-learn pandas numpy
```

### npm install stuck
```bash
npm cache clean --force
npm install
```

---

## Features Available After Setup

✅ User authentication (Login/Register)
✅ Create & manage chores
✅ Assign tasks to children
✅ AI-powered encouragement bot
✅ Rewards & gamification
✅ Progress tracking
✅ ML sentiment analysis
✅ Real-time notifications

---

## Support

**Email:** tanzeelaijazofficial@gmail.com

---

**Last Updated:** April 20, 2026
