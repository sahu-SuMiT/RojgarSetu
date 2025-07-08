const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket'); // Import the SupportTicket model
const jwt = require('jsonwebtoken'); // to verify JWT tokens
const { v4: uuidv4 } = require('uuid'); // to generate unique ticketId

const multer = require('multer'); // for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route: POST /api/support-tickets
router.post('/', upload.single('uploadedFile'), async (req, res) => {
  
  console.log("REQ FILE:", req.file);
  console.log("REQ BODY:", req.body.title);

  try {
    const authHeader = req.headers.token || req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    console.log("Token received:", token)
    // 2. Verify and decode token
    const decoded = jwt.verify(token,process.env.SESSION_SECRET);
    const userId = decoded.userId || decoded.id;
    const userType = decoded.role || decoded.type;

    if (!userId || !userType) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    const {
      title,
      description,
      priority,
      status,
      category,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Create new support ticket
    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      userId,
      userType,
      subject: title,
      description,
      priority,
      status: status || "open",
      category,
      uploadedFile: req.file ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
            filename: req.file.originalname,
            size: req.file.size
          }
        : undefined
    });

    await newTicket.save();

    res.status(201).json({ message: 'Support ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
