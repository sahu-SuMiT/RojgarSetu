const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket'); // Import the SupportTicket model
const jwt = require('jsonwebtoken'); // to verify JWT tokens
const { v4: uuidv4 } = require('uuid'); // to generate unique ticketId
const User = require('../models/User'); // Import the User model

const multer = require('multer'); // for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });


assignTicketToSales = async(ticketID) =>{
  freeSales = await User.findOne({}).sort({workload:1});
  
  const ticket = await SupportTicket.findOne({ ticketId: ticketID });
  if (!ticketID) throw new Error("Ticket ID is required");
 

  ticket.assignedTo = freeSales.email; 

  ticket.salesPerson = freeSales.firstName + " " + freeSales.lastName; // Store the sales person's ID
  await ticket.save();

  freeSales.workload += 1; // Increment the workload of the sales person
  await freeSales.save();
  console.log(`Assigned ticket ${ticketID} to ${freeSales.email}`);
  return ticket;
}

function generateSecretCode(){
  return Math.floor(1000+ Math.random() * 9000).toString(); // Generates a random 4-digit number
}

// Route: POST /api/support-tickets
router.post('/', upload.single('uploadedFile'), async (req, res) => {
  
  console.log("REQ FILE:", req.file);
  console.log("REQ BODY:", req.body);

  try {
    const {
      title,
      description,
      priority,
      status,
      category,
      user_name,
      user_email,
      user_phone,
      userType
    } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Create new support ticket
    const newTicket = new SupportTicket({
      ticketId: uuidv4(),
      userType,
      user_name,
      user_email,
      user_phone,
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
        : undefined,
      secretCode: generateSecretCode()
    });
    await newTicket.save();
    const toDisplay_and_return = await assignTicketToSales(newTicket.ticketId)
    res.status(201).json({ message: 'Support ticket created successfully', ticket: toDisplay_and_return });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
