# Sports Assessment Platform - Integration Setup Guide

## 🚀 Integration Complete!

The backend, frontend, and Python model are now fully integrated. Here's how to run the complete system:

## 📋 Prerequisites

### Backend Dependencies

```bash
cd backend
npm install
```

### Frontend Dependencies

```bash
cd frontend
npm install
```

### Python Dependencies

```bash
cd model
pip install opencv-python mediapipe numpy
```

### MongoDB

- Install and run MongoDB locally on port 27017
- Or use MongoDB Atlas (update connection string in .env)

## ⚙️ Environment Setup

### 1. Backend Environment (.env)

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 2. Frontend Environment (.env)

```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
```

## 🏃‍♂️ Running the System

### Option 1: Development Mode (Recommended)

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# Client runs on http://localhost:3000
```

### Option 2: Production Mode

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 🧪 Testing the Integration

### 1. Test Python Model Wrapper

```bash
cd model
python test_wrapper.py
```

### 2. Test Backend API

- Visit: http://localhost:5000/api
- Check health: http://localhost:5000/health
- Register a test user via frontend

### 3. Test Full Integration

1. Open frontend at http://localhost:3000
2. Register as an athlete
3. Select an exercise (bicep-curls, sit-ups, or vertical-jump)
4. Upload a test video file
5. Check analysis results

## 🔧 Key Integration Points

### Backend ➡️ Python Model

- **Endpoint:** `POST /api/analysis/analyze-video`
- **Process:** Upload → Python analysis → Database storage
- **Python Command:** `python api_wrapper.py EXERCISE_TYPE FILE video_path`

### Frontend ➡️ Backend

- **Video Upload:** `analysisAPI.analyzeVideo()`
- **Live Analysis:** `analysisAPI.startLiveAnalysis()`
- **Results:** Real-time progress + final analysis results

### Data Flow

```
Frontend Upload → Backend API → Python Model → Analysis Results → Database → Frontend Display
```

## 📁 File Structure After Integration

```
Sports-Assessment-SIH/
├── backend/
│   ├── routes/analysisRoutes.js ✅ NEW - Analysis endpoints
│   ├── uploads/videos/ ✅ NEW - Video storage
│   └── server.js ✅ UPDATED - Added analysis routes
├── frontend/
│   ├── src/services/api.ts ✅ UPDATED - Real backend integration
│   └── components/Exercise/ ✅ UPDATED - Real analysis calls
├── model/
│   ├── api_wrapper.py ✅ NEW - Backend integration wrapper
│   ├── code.py ✅ EXISTING - Your ML model
│   └── test_wrapper.py ✅ NEW - Testing script
└── README_INTEGRATION.md ✅ This file
```

## 🎯 What's Now Working

### ✅ **Video Analysis Pipeline**

- Upload video files up to 100MB
- Real Python model processing with MediaPipe
- Pose detection and exercise counting
- Form analysis and cheat detection
- Results storage in MongoDB

### ✅ **Exercise Support**

- **Bicep Curls:** Left/right arm rep counting + form analysis
- **Sit-ups:** Rep counting + form validation
- **Vertical Jump:** Height measurement + jump counting

### ✅ **Real-time Features**

- Upload progress tracking
- Analysis status updates
- Error handling and recovery

### ✅ **Data Integration**

- Backend stores analysis results
- Frontend displays real Python model output
- User session management
- Analysis history tracking

## 🔍 API Endpoints

### Authentication

- `POST /api/auth/athlete/register`
- `POST /api/auth/athlete/login`

### Analysis (New)

- `POST /api/analysis/analyze-video` - Upload & analyze video
- `POST /api/analysis/analyze-live` - Start live session
- `GET /api/analysis/video/:filename` - Stream video files
- `GET /api/analysis/results/:id` - Get analysis results
- `GET /api/analysis/history` - User's analysis history

## 🐛 Troubleshooting

### Python Model Issues

```bash
# Test Python dependencies
python -c "import cv2, mediapipe, numpy; print('All dependencies OK')"

# Test wrapper directly
cd model
python api_wrapper.py BICEP_CURLS FILE test_video.mp4
```

### Backend Issues

```bash
# Check MongoDB connection
curl http://localhost:5000/api/status/database

# Test analysis endpoint
curl -X POST http://localhost:5000/api/analysis/analyze-video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@test_video.mp4" \
  -F "exerciseType=bicep-curls"
```

### Frontend Issues

- Check browser console for API errors
- Verify VITE_API_URL in .env matches backend
- Test video upload with small files first

## 🎊 Success Indicators

You'll know the integration is working when:

1. ✅ Python test script runs without errors
2. ✅ Backend health check returns database connected
3. ✅ Frontend can register/login users
4. ✅ Video upload shows real progress bar
5. ✅ Analysis results show actual Python model data
6. ✅ ResultsDashboard displays real form scores and rep counts

## 📈 Next Steps

Your MVP is now ready! Consider these enhancements:

- WebSocket for live pose detection
- Video playback with analysis overlay
- Performance comparison charts
- Mobile app integration
- Cloud deployment (AWS/Heroku)

---

**🎉 Congratulations! Your Sports Assessment Platform is fully integrated and ready for demo!**
