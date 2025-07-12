require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const http = require('http');
const socket = require('./socket');

// Importing the scheduler
const startTicketEscalationJob = require('./scheduler/scheduler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/user');
const placementRoutes = require('./routes/placement');
const companyRoutes = require('./routes/company');
const rolesRoutes = require('./routes/roles');
const employeesRoutes = require('./routes/employees');
const collegesRoutes = require('./routes/colleges');
const internshipsRoutes = require('./routes/internships');
const supportRoutes = require('./routes/support');
const studentMatchingRoutes = require('./routes/studentMatchingRoutes');
const supportTicketRoutes = require('./routes/support-ticket');
const bcrypt = require('bcrypt');
const Student = require('./models/Student');

//admin
const studentAdminRoutes = require('./routes/admin/studentAdminRoutes');
const signup = require('./controllers/user/signup');


// sales
const salesRoutes = require('./routes/sales'); // Assuming you have a sales route file

const app = express();
const server = http.createServer(app); // <-- Create HTTP server

// Initialize Socket.IO
const io = socket.init(server);

// Basic Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);

  socket.on('join', (studentId) => {
    if (studentId) {
      socket.join(studentId);
      console.log(`Socket ${socket.id} joined room: ${studentId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// CORS setup for development and production
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  // Production origins
  'https://campusadmin-y4hh.vercel.app',
  'https://campusadmin.vercel.app',
  'https://www.rojgarsetu.org',
  'https://company.rojgarsetu.org',
  'https://payomatixpaymentgateway.onrender.com',
  'https://campusadmin.onrender.com',
];

// Add environment variable origins
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.REACT_URL) {
  allowedOrigins.push(process.env.REACT_URL);
}
// Add multiple frontend URLs if needed
if (process.env.ADDITIONAL_FRONTEND_URLS) {
  const additionalUrls = process.env.ADDITIONAL_FRONTEND_URLS.split(',');
  allowedOrigins.push(...additionalUrls);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed for origin: ' + origin), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Requested-With'],
  optionsSuccessStatus: 200,
  preflightContinue: false,
}));

// Configure Helmet with more permissive settings for development
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "https://localhost:*"],
    },
  },
}));

// Handle preflight requests
app.options('*', cors());

// Remove or comment out the custom headers middleware that sets Access-Control-Allow-Origin: '*'

const Campus_INTERNAL_SECRET = process.env.CAMPUS_INTERNAL_SECRET;
if (!Campus_INTERNAL_SECRET) {
  console.error("Critical Error: CAMPUS_INTERNAL_SECRET is not set in environment variables.");
  process.exit(1);
}
console.log('Starting server initialization...');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const formattedDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  console.log(`Connected to Database: ${process.env.MONGODB_URI} | ${formattedDate} | ${process.env.MONGODB_URI}`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connection established successfully');
});

//additional routes that are not included here from routes folder
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/students', require('./routes/students'));
app.use('/api/tickets', require('./routes/supportTicketRoutes'));

// New REST endpoints
app.use('/api/auth', authRoutes); // for authentication-related endpoints (login/register)
app.use('/api/studentJobs', jobRoutes);
app.use('/api/kyc', require('./routes/kyc')); 
app.use('/api/internships', internshipsRoutes);
app.use('/api/studentInterviews', interviewRoutes);
app.use('/api/studentApplications', applicationRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/studentsProfile', studentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', supportTicketRoutes);


// admin routes

app.use('/api/admin', studentAdminRoutes);
app.use('/api/signup', signup);
app.use('/api/admin', require('./routes/admin/platformSettingsRoutes'));

//sales
app.use('/api/sales', salesRoutes);
// Make sure portfolioRoutes is properly loaded
const portfolioRoutes = require('./routes/portfolioRoutes');
app.use('/api/portfolio', portfolioRoutes);
// Log available routes for debugging
console.log('Portfolio routes registered:', portfolioRoutes.stack.map(r => r.route?.path).filter(Boolean));

// NEW: /api/student/me and /api/student/me/profile-pic endpoints
//     This route should implement: GET /api/student/me, PUT /api/student/me, POST /api/student/me/profile-pic, etc.
app.use('/api/student', studentRoutes); // <-- This must be after any /api/student/:something routes


// Health check/test route
app.get('/', (req, res) => {
  res.send('Backend running!');
});

// Socket.IO health check route
app.get('/socket.io/', (req, res) => {
  res.json({ 
    status: 'Socket.IO server is running',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount || 0
  });
});

// Socket.IO endpoint test
app.get('/socket-test', (req, res) => {
  res.json({ 
    message: 'Socket.IO endpoint is accessible',
    socketIO: 'enabled',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin
    }
  });
});

// Debug route to test CORS
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Simple test route for debugging
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    cors: 'enabled',
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      userAgent: req.headers['user-agent']
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Other Sales and Support routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/placement', placementRoutes);

// Add after other app.use for routes
app.use('/api/student-matching', studentMatchingRoutes);

//support-ticket routes
app.use('/api/support-ticket',supportTicketRoutes);

// Add the payment update route
app.use('/api/payment-update', require('./routes/paymentRoutes'));

startTicketEscalationJob(); // Start the ticket escalation job

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // <-- Use server.listen instead of app.listen
  console.log(`Server listening on port ${PORT}`);
});