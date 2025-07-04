const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/support-tickettt'); // adjust path if needed
const { v4: uuidv4 } = require('uuid'); // to generate unique ticketId

// Route: POST /api/support-tickets
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      status,
      category,
      uploadedFile,
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Create new support ticket
    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      title,
      description,
      priority,
      status: status || "open",
      category,
      uploadedFile,
    });

    await newTicket.save();

    res.status(201).json({ message: 'Support ticket created successfully', ticket: newTicket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
