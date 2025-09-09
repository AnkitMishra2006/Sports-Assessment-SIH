# Sports Assessment Platform - Backend

Backend API for the democratized athlete talent assessment platform built for Smart India Hackathon.

## 🎯 Project Overview

This backend serves a mobile/web platform that allows athletes from across India to self-record their performance in standardized fitness tests and get instant feedback. Officials can review submissions, validate results, and generate reports.

## 🏗️ Architecture

- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Cloud storage for videos (AWS S3/Firebase)
- **AI Integration**: Mock AI analysis (TensorFlow Lite/MediaPipe for production)

## 📦 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── models/
│   ├── Athlete.js          # Athlete profile schema
│   ├── Official.js         # SAI official schema
│   ├── Submission.js       # Test submission schema
│   └── index.js            # Model exports
├── routes/                 # API routes (coming soon)
├── middleware/             # Custom middleware (coming soon)
├── controllers/            # Route controllers (coming soon)
├── services/               # Business logic (coming soon)
├── utils/                  # Utility functions (coming soon)
├── uploads/                # File uploads directory
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── server.js               # Main server file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables**

   Copy `.env` file and update the values:

   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sports-assessment
   JWT_SECRET=your_super_secret_jwt_key_here
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB**

   Make sure MongoDB is running on your system:

   ```bash
   # For local MongoDB
   mongod

   # Or use MongoDB Atlas cloud connection
   # Update MONGODB_URI in .env file
   ```

4. **Start the server**

   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

5. **Verify installation**

   Open your browser and visit:

   - Health check: http://localhost:5000/health
   - API info: http://localhost:5000/api
   - Database status: http://localhost:5000/api/status/database

## 📊 Database Models

### Athlete Model

- Personal information (name, age, gender, location)
- Physical measurements (height, weight)
- Sports preferences and experience
- Gamification (points, badges, level)
- Account status and verification

### Official Model

- Employee details and credentials
- Role-based permissions
- Assigned regions and specializations
- Performance metrics
- Review statistics

### Submission Model

- Test performance data
- Video evidence and metadata
- AI analysis results (mock)
- Review status and official feedback
- Analytics and rankings
- Audit trail

## 🔐 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents API abuse
- **CORS**: Cross-origin resource sharing
- **Password Hashing**: bcryptjs with salt
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Mongoose schema validation

## 📊 Available Endpoints

### Health & Status

- `GET /health` - Server health check
- `GET /api` - API information
- `GET /api/status/database` - Database connection status

### Coming Soon

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/athletes` - Get athlete profiles
- `POST /api/submissions` - Submit test performance
- `GET /api/officials/dashboard` - Official dashboard
- `GET /api/reports` - Generate reports

## 🛠️ Development

### Database Connection Features

The database connection includes:

- **Auto-reconnection**: Handles connection drops
- **Connection pooling**: Optimized for performance
- **Health monitoring**: Real-time status checks
- **Graceful shutdown**: Clean disconnection on app termination
- **Event logging**: Detailed connection status logs

### Environment Configuration

Key environment variables:

```env
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/sports-assessment

# Security
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000

# File Uploads
MAX_FILE_SIZE=50mb
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Scripts

```bash
npm run dev     # Start development server with nodemon
npm start       # Start production server
npm test        # Run tests (coming soon)
```

## 🔄 API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Error Type",
  "message": "Error description",
  "timestamp": "2025-09-09T10:30:00.000Z"
}
```

## 🚧 Development Roadmap

### Phase 1 (Current)

- ✅ Database connection setup
- ✅ MongoDB models (Athlete, Official, Submission)
- ✅ Basic server structure
- ✅ Health check endpoints

### Phase 2 (Next)

- 🔄 Authentication & Authorization
- 🔄 File upload handling
- 🔄 API routes implementation
- 🔄 Input validation middleware

### Phase 3 (Future)

- 📋 AI integration for video analysis
- 📋 Real-time notifications
- 📋 Advanced analytics
- 📋 Performance optimization

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write meaningful commit messages
5. Test your changes

## 📞 Support

For questions or issues:

- Check the health endpoint: `/health`
- Review the API documentation: `/api`
- Check server logs for detailed error information

---

**Built for Smart India Hackathon - Democratizing Sports Talent Assessment** 🏏🏃‍♂️⚽
