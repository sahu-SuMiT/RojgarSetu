const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const Student = require('../models/Student'); // Adjust the import path as needed
const User = require('../models/User');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private',
    key: (req, file, cb) => {
      cb(null, `documents/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
    }
  },
});

// MongoDB Schemas
const DocumentSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  status: { type: String, enum: ['verified', 'pending', 'missing', 'rejected'] },
  lastUpdated: String,
  source: { type: String, enum: ['digi-kyc', 'manual'] },
  kycId: String,
  downloadUrl: String,
  userId: String,
});

const VerificationTicketSchema = new mongoose.Schema({
  id: String,
  studentName: String,
  documentType: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  uploadedFile: String,
  created: String,
  description: String,
  userId: String,
});

const Document = mongoose.model('Document', DocumentSchema);
const VerificationTicket = mongoose.model('VerificationTicket', VerificationTicketSchema);

// DigiLocker API Configuration (Mocked as Digio)
const DIGILOCKER_CONFIG = {
  BASE_URL: process.env.DIGILOCKER_BASE_URL || 'https://api.digio.in',
  CLIENT_ID: process.env.DIGILOCKER_CLIENT_ID,
  CLIENT_SECRET: process.env.DIGILOCKER_CLIENT_SECRET,
  REDIRECT_URI: process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3001/digilocker/callback',
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    req.user.userId = user.id || user._id; // Ensure user ID is set
    next();
  });
};

// Middleware to check if user is admin (optional, uncomment to restrict to admins)
const restrictToAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    console.error('Error checking admin status:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const generateVerificationId = () => {
  return `REF_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const verifyWithDigio = async (kycData, retries = 3, backoff = 3000) => {
  const { email, phone, firstName, lastName, verificationId } = kycData;
  const productionUrl = process.env.DIGIO_PRODUCTION_URL || 'https://api.digio.in';
  const clientId = process.env.DIGIO_CLIENT_ID;
  const clientSecret = process.env.DIGIO_CLIENT_SECRET;

  if (!email && !phone) throw new Error('Either email or phone is required');

  const refId = verificationId && /^REF_\d+_[a-z0-9]+$/.test(verificationId)
    ? verificationId
    : generateVerificationId();

  try {
    const requestPayload = {
      customer_identifier: email || phone,
      identifier_type: email ? 'email' : 'mobile',
      customer_name: `${firstName} ${lastName}`,
      template_name: 'DIGILOCKER_AADHAAR_PAN',
      notify_customer: true,
      generate_access_token: true,
    };

    const requestResponse = await axios.post(
      `${productionUrl}/client/kyc/v2/request/with_template`,
      requestPayload,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      verificationId: requestResponse.data.id,
      accessToken: requestResponse.data.access_token?.id,
      expiresInDays: requestResponse.data.expire_in_days,
      referenceId: requestResponse.data.reference_id,
      message: 'KYC verification initiated successfully',
      digilockerUrl: requestResponse.data.redirect_url
    };
  } catch (error) {
    console.error('Digio API error:', error.response?.data);
    throw new Error('Document verification failed with Digio');
  }
};

// Check KYC status using Digio API
const checkKycStatus = async (verificationId, retries = 3, backoff = 3000) => {
  const productionUrl = process.env.DIGIO_PRODUCTION_URL || 'https://api.digio.in';
  const clientId = process.env.DIGIO_CLIENT_ID;
  const clientSecret = process.env.DIGIO_CLIENT_SECRET;

  try {
    const response = await axios.post(
      `${productionUrl}/client/kyc/v2/${verificationId}/response`,
      {},
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Digio status response:', response.data);

    return response.data;
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return checkKycStatus(verificationId, retries - 1, backoff * 2);
    }
    console.error('Digio status check error:', error.response?.data);
    throw new Error('Failed to check KYC status');
  }
};

// @route   POST api/kyc/decision
// @desc    Approve or reject a KYC request using Digio API
// @access  Private (Admin only, uncomment restrictToAdmin to enforce)
router.post('/decision',  /* restrictToAdmin, */ async (req, res) => {
  const { verificationId, decision, reason } = req.body;

  // Validate inputs
  if (!verificationId || !decision || (decision === 'reject' && !reason)) {
    return res.status(400).json({ error: 'Verification ID and decision are required. Reason is required for rejection.' });
  }

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ error: 'Invalid decision. Must be "approved" or "rejected".' });
  }

  const productionUrl = process.env.DIGIO_PRODUCTION_URL || 'https://api.digio.in';
  const clientId = process.env.DIGIO_CLIENT_ID;
  const clientSecret = process.env.DIGIO_CLIENT_SECRET;

  try {
    // Find student by verificationId
    const student = await Student.findOne({ 'kycData.verificationId': verificationId });
    if (!student) {
      return res.status(404).json({ error: 'Student not found with provided verification ID' });
    }

    // Call Digio API to approve/reject KYC
    const response = await axios.post(
      `${productionUrl}/client/kyc/v2/request/${verificationId}/manage_approval`,
      {
        status:decision,
        ...(reason && { reason }) // Include reason only for rejection
      },
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update student KYC data
    student.kycStatus = decision === 'approved' ? 'verified' : 'rejected';
    student.kycData = {
      ...student.kycData,
      status: decision === 'approved' ? 'verified' : 'rejected',
      lastUpdated: new Date().toISOString().split('T')[0],
      ...(reason && { rejectionReason: reason }) // Store rejection reason if provided
    };
    student.iskycVerified = true;

    await student.save();

    res.json({
      success: true,
      message: `KYC request ${decision === 'approve' ? 'approved' : 'rejected'} successfully`,
      kycStatus: student.kycStatus,
      kycData: student.kycData
    });
  } catch (error) {
    console.error(`Error ${decision}ing KYC:`, error.response?.data || error.message);
    res.status(500).json({
      error: `Failed to ${decision} KYC: ${error.response?.data?.message || error.message || 'Unknown error'}`
    });
  }
});

// @route   POST api/kyc/verify-digio
// @desc    Verify KYC with Digio API (for standalone use)
// @access  Private
router.post('/verify-digio', async (req, res) => {
  try {
    const kycData = req.body;
    const user = await Student.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let verificationId = user.kycData?.verificationId;
    let digioResult;
    if (!verificationId) {
      digioResult = await verifyWithDigio({ ...kycData });
      verificationId = digioResult.verificationId;
    } else {
      digioResult = await verifyWithDigio({ ...kycData, verificationId });
    }

    user.kycData = {
      verificationId: digioResult.verificationId,
      accessToken: digioResult.accessToken,
      expiresInDays: digioResult.expiresInDays,
      status: digioResult.status || 'pending',
      digilockerUrl: digioResult.digilockerUrl
    };

    if (digioResult.status === 'verified' || digioResult.status === 'approved') {
      user.kycStatus = 'verified';
      user.iskycVerified = true;
    } else if (digioResult.status === 'pending' || digioResult.status === 'pending approval') {
      user.kycStatus = 'pending approval';
      user.iskycVerified = false;
    } else if (digioResult.status === 'rejected') {
      user.kycStatus = 'rejected';
      user.iskycVerified = false;
    } else {
      user.kycStatus = 'pending';
      user.iskycVerified = false;
    }

    await user.save();

    return res.json({
      success: true,
      verificationId: digioResult.verificationId,
      accessToken: digioResult.accessToken,
      expiresInDays: digioResult.expiresInDays,
      message: 'KYC verification initiated with Digio',
      status: user.kycStatus,
      iskycVerified: user.iskycVerified,
      digilockerUrl: digioResult.digilockerUrl
    });
  } catch (error) {
    console.error('Digio verification failed:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'KYC verification failed'
    });
  }
});

// @route   GET api/kyc/status
// @desc    Get KYC status
// @access  Private
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await Student.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.kycStatus === 'pending' && user.kycData?.verificationId) {
      try {
        const digioStatus = await checkKycStatus(user.kycData.verificationId);
        user.kycStatus = digioStatus.status === 'completed' ? 'verified' : digioStatus.status || 'pending';
        user.kycData = {
          ...user.kycData,
          status: digioStatus.status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        await user.save();
      } catch (error) {
        console.error(`Failed to check Digio status for user ${user._id}:`, error.message);
      }
    }

    res.json({
      kycStatus: user.kycStatus,
      uhid: user.uhid,
      kycData: user.kycData
    });
  } catch (err) {
    console.error('Status route error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Initiate KYC Verification
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${DIGILOCKER_CONFIG.BASE_URL}/request`, {
      clientId: DIGILOCKER_CONFIG.CLIENT_ID,
      redirectUrl: DIGILOCKER_CONFIG.REDIRECT_URI,
    });

    const newDoc = new Document({
      id: `kyc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: 'KYC Verification Request',
      type: 'kyc',
      status: 'pending',
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'digi-kyc',
      kycId: response.data.id,
      userId: req.user.userId,
    });

    await newDoc.save();

    res.json({
      requestId: response.data.id,
      digilockerUrl: response.data.digilockerUrl,
      message: 'KYC verification initiated successfully',
    });
  } catch (error) {
    console.error('Error initiating KYC verification:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate KYC verification' });
  }
});

// Initiate DigiLocker OAuth Flow
router.post('/digilocker/request', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${DIGILOCKER_CONFIG.BASE_URL}/request`, {
      clientId: DIGILOCKER_CONFIG.CLIENT_ID,
      redirectUrl: DIGILOCKER_CONFIG.REDIRECT_URI,
    });
    res.json({
      requestId: response.data.requestId,
      digilockerUrl: response.data.digilockerUrl,
    });
  } catch (error) {
    console.error('Error initiating DigiLocker request:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate DigiLocker request' });
  }
});

// Handle DigiLocker Callback
router.get('/digilocker/callback', authenticateToken, async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Authorization code missing' });

  try {
    const response = await axios.post(`${DIGILOCKER_CONFIG.BASE_URL}/token`, {
      clientId: DIGILOCKER_CONFIG.CLIENT_ID,
      clientSecret: DIGILOCKER_CONFIG.CLIENT_SECRET,
      code,
      redirectUrl: DIGILOCKER_CONFIG.REDIRECT_URI,
    });

    const { accessToken } = response.data;
    req.user.accessToken = accessToken;

    await Document.updateOne(
      { userId: req.user.userId, type: 'kyc', status: 'pending' },
      { status: 'verified', lastUpdated: new Date().toISOString().split('T')[0] }
    );

    res.redirect('/documents');
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Fetch Document List
router.get('/digilocker/documents', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${DIGILOCKER_CONFIG.BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    });

    const documents = response.data.documents.map(doc => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: doc.description,
      type: doc.docType,
      status: 'pending',
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'digi-kyc',
      kycId: doc.docType + '-' + doc.orgId,
      userId: req.user.userId,
    }));

    await Document.insertMany(documents);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Fetch Specific Document
router.post('/digilocker/fetch-document', authenticateToken, async (req, res) => {
  const { docType, orgId, format, parameters } = req.body;
  try {
    const response = await axios.post(
      `${DIGILOCKER_CONFIG.BASE_URL}/fetch-document`,
      { docType, orgId, format, parameters },
      { headers: { Authorization: `Bearer ${req.user.accessToken}` } }
    );

    const documentData = response.data;
    const downloadUrl = documentData.fileUrl || '';

    const newDoc = new Document({
      id: `doc-${Date.now()}`,
      name: documentData.description || docType,
      type: docType,
      status: 'verified',
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'digi-kyc',
      kycId: `${docType}-${orgId}`,
      downloadUrl,
      userId: req.user.userId,
    });

    await newDoc.save();
    res.json({ ...newDoc.toObject(), downloadUrl });
  } catch (error) {
    console.error('Error fetching document:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create Verification Ticket
router.post('/tickets', authenticateToken, upload.single('file'), async (req, res) => {
  const { documentType, description } = req.body;
  if (!documentType || !description) {
    return res.status(400).json({ error: 'Document type and description are required' });
  }

  try {
    const ticket = new VerificationTicket({
      id: `VT${Date.now()}`,
      studentName: req.user.name || 'Unknown',
      documentType,
      status: 'pending',
      uploadedFile: req.file ? req.file.key : null,
      created: new Date().toISOString().split('T')[0],
      description,
      userId: req.user.userId,
    });

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get All Documents for a User
router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get All Tickets for a User
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await VerificationTicket.find({ userId: req.user.userId });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Download Document from S3
router.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id, userId: req.user.userId });
    if (!document || !document.downloadUrl) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.downloadUrl,
    };

    const { Body } = await s3.getObject(params).promise();
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.send(Body);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// @route   GET api/kyc/all-status
// @desc    Get all students' KYC status and data
// @access  Private (Admin only, uncomment restrictToAdmin to enforce)
router.get('/all-status', /* restrictToAdmin, */ async (req, res) => {
  try {
    const students = await Student.find({}, 'name email kycStatus kycData');
    res.json(students);
  } catch (err) {
    console.error('Error fetching all KYC statuses:', err.message);
    res.status(500).json({ error: 'Failed to fetch KYC statuses' });
  }
});

// Mount router to app
app.use('/api', router);

module.exports = router;