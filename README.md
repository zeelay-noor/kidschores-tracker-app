# Kids Chores Tracker - Daily Routine Management Web Application

A full-stack web application designed to help parents manage their children's daily chores, study activities, and track progress with gamification and AI-powered encouragement.

## 🎯 Project Overview

**Final Year Project (FYP) - BSCS**  
**Developer:** [Your Name]  
**Institution:** [Your University]  
**Year:** 2026

---

## ✨ Features

### Core Functionality
1. **User Authentication & Registration**
   - Secure login/signup system
   - JWT-based authentication
   - Role-based access (Parent/Child)

2. **Parent Dashboard**
   - Create and manage chores
   - Assign tasks to children
   - Monitor completion status
   - Track overall progress

3. **Child Profile Management**
   - Add multiple child profiles
   - Manage child accounts
   - View assigned tasks per child

4. **Child Dashboard**
   - View assigned chores and activities
   - Mark tasks as complete
   - Track personal progress

5. **Chores and Task Management**
   - Create, update, delete chores
   - Set due dates and points
   - Status tracking (pending/completed)

6. **Study Activities Module**
   - Manage educational tasks
   - Subject-based organization
   - Duration tracking

7. **AI-Powered Encouragement Bot** 🤖
   - Machine Learning sentiment analysis
   - Personalized motivational messages
   - Progress-based encouragement
   - **5 ML Models Trained & Compared**

8. **Rewards & Gamification System** 🏆
   - Points-based reward system
   - Badge achievements
   - Level progression (every 100 points)
   - Leaderboard functionality

9. **Progress Tracking & Reports**
   - Visual progress indicators
   - Completion statistics
   - Points and level tracking

10. **Notification System** 🔔
    - Browser notifications
    - Task creation alerts
    - Completion celebrations
    - Level-up notifications

11. **Database Management**
    - MongoDB Atlas cloud database
    - Secure data storage
    - RESTful API architecture

---

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI Framework
- **React Router** - Navigation
- **Axios** - API Communication
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Encryption

### Machine Learning
- **Python 3.13** - ML Development
- **Flask** - ML API Service
- **scikit-learn** - ML Library
- **pandas** - Data Processing
- **numpy** - Numerical Computing

### ML Models Trained
1. **Logistic Regression** - 75.30% ✅ (Best)
2. Random Forest - 74.00%
3. SVM - 73.90%
4. Naive Bayes - 73.55%
5. Decision Tree - 65.15%

**Dataset:** Sentiment140 (10,000 samples)  
**Task:** Binary Sentiment Classification (Positive/Negative)

---

## 📁 Project Structure
```
kidschorestracker/
├── server/                    # Backend (Node.js)
│   ├── config/               # Database configuration
│   ├── models/               # MongoDB schemas
│   ├── controllers/          # Business logic
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   └── server.js            # Main server file
│
├── client/                   # Frontend (React)
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   └── App.js          # Main app component
│   └── public/
│
├── ml_service/              # ML Service (Python/Flask)
│   ├── train_model.py      # Model training script
│   ├── app.py              # Flask API
│   ├── best_model.pkl      # Trained model
│   ├── vectorizer.pkl      # Text vectorizer
│   └── model_info.txt      # Model details
│
├── .env                     # Environment variables
├── package.json            # Node dependencies
└── README.md              # Documentation
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB Atlas account
- npm or yarn

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd kidschorestracker
```

### Step 2: Install Backend Dependencies
```bash
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### Step 4: Install ML Service Dependencies
```bash
cd ml_service
pip install flask flask-cors scikit-learn pandas numpy
cd ..
```

### Step 5: Configure Environment Variables
Create `.env` file in root directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Step 6: Train ML Model (Optional - pre-trained model included)
```bash
cd ml_service
python train_model.py
cd ..
```

---

## ▶️ Running the Application

You need to run **3 services** simultaneously:

### Terminal 1: Backend Server
```bash
node server/server.js
```
**Runs on:** http://localhost:5000

### Terminal 2: Frontend Server
```bash
cd client
npm start
```
**Runs on:** http://localhost:3000

### Terminal 3: ML Service
```bash
cd ml_service
python app.py
```
**Runs on:** http://localhost:5001

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chores
- `GET /api/chores` - Get all chores
- `POST /api/chores` - Create chore
- `PUT /api/chores/:id` - Update chore
- `DELETE /api/chores/:id` - Delete chore

### Study Activities
- `GET /api/study` - Get activities
- `POST /api/study` - Create activity
- `PUT /api/study/:id` - Update activity
- `DELETE /api/study/:id` - Delete activity

### Children Management
- `GET /api/users/children` - Get children
- `POST /api/users/children` - Add child
- `DELETE /api/users/children/:id` - Delete child

### Rewards
- `GET /api/rewards` - Get user rewards
- `POST /api/rewards/update` - Update points

### AI Bot
- `GET /api/ai/encouragement` - Get motivation
- `GET /api/ai/personalized` - Personalized message
- `POST /api/ai/analyze` - ML sentiment analysis

### ML Service
- `POST /predict` - Sentiment prediction
- `GET /health` - Service health check

---

## 🧪 Testing

### Test User Accounts
**Parent Account:**
- Email: parent@test.com
- Password: 123456

**Child Account:**
- Email: child@test.com
- Password: 123456

### Test ML Model
1. Go to AI Bot page
2. Enter text: "I love completing my homework!"
3. Click "Analyze Sentiment"
4. Should return: Positive sentiment

---

## 🎓 Machine Learning Details

### Model Training Process
1. **Dataset:** Sentiment140 (1.6M tweets, used 10K samples)
2. **Preprocessing:** Text vectorization using TF-IDF
3. **Train/Test Split:** 80/20
4. **Models Evaluated:** 5 different algorithms
5. **Best Model:** Logistic Regression (75.30% accuracy)

### Model Files
- `best_model.pkl` - Trained model (serialized)
- `vectorizer.pkl` - Text vectorizer
- `model_info.txt` - Training details

---

## 🐛 Known Issues & Solutions

### MongoDB Connection Error
**Solution:** Check MongoDB Atlas Network Access and add your IP address

### ML Service Not Running
**Solution:** Ensure Flask is installed: `pip install flask flask-cors`

### Port Already in Use
**Solution:** Kill existing process or change port in config

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes
- Input validation
- CORS configuration

---

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Social features (friend challenges)
- [ ] Calendar integration
- [ ] Multi-language support

---

## 👨‍💻 Developer

**Name:** [Your Name]  
**Email:** [Your Email]  
**GitHub:** [Your GitHub Profile]  
**LinkedIn:** [Your LinkedIn]

---

## 📄 License

This project is developed as a Final Year Project for academic purposes.

---

## 🙏 Acknowledgments

- Sentiment140 Dataset by Stanford University
- MongoDB Atlas for database hosting
- React.js and Node.js communities
- scikit-learn documentation

---

## 📞 Support

For issues or questions, please contact [your email] or create an issue in the repository.

---

**⭐ If you find this project helpful, please give it a star!**