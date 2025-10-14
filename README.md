# WindBorne Systems - Constellation Tracker

Real-time weather balloon tracking system with AI-powered insights, combining WindBorne's balloon constellation data with OpenWeatherMap API and Google Gemini AI.

## 🚀 Features

- **Real-time Balloon Tracking**: Fetches and displays data from 24 hours of balloon flight history
- **Interactive Map**: Visualize balloon positions with altitude-based color coding
- **Weather Integration**: Correlates balloon positions with real-time weather data
- **AI Insights**: Gemini AI analyzes patterns and provides operational recommendations
- **Advanced Analytics**: Charts, statistics, and geographic distribution analysis
- **Auto-refresh**: Updates every 5 minutes with caching for performance

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- Axios for API calls
- Google Gemini AI
- OpenWeatherMap API
- Node-Cache for performance

**Frontend:**
- React 18
- Leaflet + React-Leaflet for maps
- Recharts for data visualization
- Modern CSS with dark theme

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenWeatherMap API key (free tier works)
- Google Gemini API key (free tier works)

## 🔧 Setup Instructions

### 1. Clone or Create Project Structure

```bash
mkdir windborne-challenge
cd windborne-challenge
```

### 2. Setup Backend

```bash
# Create backend directory
mkdir backend
cd backend

# Create package.json (use the provided package.json)
npm init -y

# Install dependencies
npm install express cors axios dotenv @google/generative-ai node-cache

# Install dev dependencies
npm install --save-dev nodemon

# Create .env file
touch .env
```

Edit `backend/.env`:
```env
OPENWEATHER_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
PORT=5000
```

**Get API Keys:**
- OpenWeatherMap: https://openweathermap.org/api (sign up, free tier)
- Gemini: https://makersuite.google.com/app/apikey (Google account required)

### 3. Setup Frontend

```bash
# Go back to root
cd ..

# Create React app
npx create-react-app frontend

cd frontend

# Install additional dependencies
npm install leaflet react-leaflet axios recharts
```

### 4. Copy All Files

Copy all the provided files into their respective locations:

**Backend files:**
- `backend/package.json`
- `backend/server.js`
- `backend/.env`
- `backend/services/balloonService.js`
- `backend/services/weatherService.js`
- `backend/services/geminiService.js`

**Frontend files:**
- `frontend/package.json`
- `frontend/public/index.html`
- `frontend/src/index.js`
- `frontend/src/App.js`
- `frontend/src/services/api.js`
- `frontend/src/components/Map.js`
- `frontend/src/components/Stats.js`
- `frontend/src/components/WeatherPanel.js`
- `frontend/src/components/AIInsights.js`
- `frontend/src/components/BalloonList.js`
- `frontend/src/styles/App.css`

## 🚀 Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm start
```

Backend will run on `http://localhost:5000`

### Start Frontend (Terminal 2)

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

The app should automatically open in your browser!

## 🌐 Deployment

### Backend Deployment (Railway/Render)

**Railway:**
1. Push code to GitHub
2. Go to railway.app
3. Create new project from GitHub repo
4. Add environment variables in Railway dashboard
5. Deploy!

**Render:**
1. Push code to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set build command: `cd backend && npm install`
6. Set start command: `cd backend && npm start`
7. Add environment variables
8. Deploy!

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
cd frontend
npm install -g vercel
vercel
```

Add environment variable:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

**Netlify:**
```bash
cd frontend
npm run build
```

Drag and drop the `build` folder to Netlify dashboard.

Add environment variable in Netlify:
```
REACT_APP_API_URL=https://your-backend-url.com/api
```

## 📊 Why This Combination?

**Balloon Data + Weather Data + AI = Powerful Insights**

- **Data Quality Analysis**: Compare balloon sensor readings with ground-truth weather stations
- **Flight Path Optimization**: Identify optimal weather conditions for balloon deployment
- **Geographic Coverage**: Visualize data collection gaps and opportunities
- **Predictive Maintenance**: Correlate weather patterns with balloon performance
- **Operational Intelligence**: AI-generated recommendations for deployment strategy

## 🧪 Testing

Test the API endpoints:

```bash
# Get all data
curl http://localhost:5000/api/data

# Get balloon data only
curl http://localhost:5000/api/balloons

# Ask AI a question
curl -X POST http://localhost:5000/api/ai/question \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the optimal flight conditions?"}'
```

## 📝 Submission

Once deployed, submit using POST request:

```bash
curl -X POST https://windbornesystems.com/career_applications.json \
  -H "Content-Type: application/json" \
  -d '{
    "career_application": {
      "name": "Your Name",
      "email": "your.email@example.com",
      "role": "Junior Web Developer",
      "notes": "I excel at translating complex data into intuitive interfaces and thrive in collaborative, fast-paced environments. I chose OpenWeatherMap because correlating balloon atmospheric readings with ground-based weather stations enables powerful data quality validation and reveals atmospheric patterns critical for optimizing flight operations.",
      "submission_url": "https://your-app.vercel.app",
      "portfolio_url": "https://github.com/yourname/best-project",
      "resume_url": "https://your-resume-url.com"
    }
  }'
```

## 🎯 Key Features Showcase

1. **Robust Data Handling**: Gracefully handles corrupted JSON files
2. **Real-time Updates**: Auto-refresh with intelligent caching
3. **Interactive Visualization**: Multiple views (map, list, charts)
4. **AI Integration**: Gemini AI provides intelligent insights
5. **Weather Correlation**: Combines multiple data sources meaningfully
6. **Performance Optimized**: Caching, selective data loading
7. **Responsive Design**: Works on desktop and mobile
8. **Error Handling**: Comprehensive error management

## 🐛 Troubleshooting

**Backend not starting:**
- Check if .env file exists with valid API keys
- Ensure port 5000 is not in use

**Frontend can't connect:**
- Check if backend is running on port 5000
- Verify proxy setting in frontend/package.json

**Map not showing:**
- Check browser console for errors
- Ensure Leaflet CSS is loaded

**AI insights not working:**
- Verify Gemini API key is valid
- Check backend logs for API errors

## 📧 Contact

Built with ❤️ for WindBorne Systems application

---

**Note**: Make sure to replace all placeholder values (API keys, URLs, names) with your actual information before deployment!