const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");
const { createStudentNotification, createCollegeNotification, createCompanyNotification } = require('../utils/notificationHelper');

// --- Real Email Setup (Gmail) ---
const {emailTransport} = require('../config/email');

/**
 * Send real email using Gmail
 */
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to,
    subject,
    text,
  };
  await emailTransport.sendMail(mailOptions);
}

/**
 * Save portal notification in DB
 */
async function sendPortalNotification(userId, text) {
  try {
    // Create a system notification for the user
    await createStudentNotification(
      userId, 
      'Support Ticket Update', 
      text, 
      {
        type: 'info',
        category: 'system',
        senderModel: 'System'
      }
    );
  } catch (error) {
    console.error('Error creating portal notification:', error);
  }
}

function generateTicketId() {
  return (
    "TCK" +
    crypto.randomBytes(3).toString("hex").toUpperCase()
  );
}

function generateSecretCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Create support ticket with notification
 */
exports.createSupportTicket = async (req, res) => {
  try {
    const { userId, userType, user_name, user_email, user_phone, subject, description, category, priority, email, secretCode } = req.body;
    
    // Generate unique ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const supportTicket = new SupportTicket({
      ticketId,
      userId,
      userType,
      user_name,
      user_email,
      user_phone,
      subject,
      description,
      category,
      priority,
      email,
      secretCode,
      messages: [{
        sender: user_name,
        senderType: 'user',
        message: description,
        timestamp: new Date()
      }]
    });
    
    await supportTicket.save();
    
    // Create notification for the user
    try {
      if (userType === 'Student') {
        await createStudentNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      } else if (userType === 'College') {
        await createCollegeNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      } else if (userType === 'Company') {
        await createCompanyNotification(
          userId,
          'Support Ticket Created',
          `Your support ticket "${subject}" has been created successfully. Ticket ID: ${ticketId}`,
          {
            type: 'success',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Ticket'
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating support ticket notification:', notificationError);
      // Don't fail the ticket creation if notification fails
    }
    
    res.status(201).json({
      message: 'Support ticket created successfully',
      ticketId: supportTicket.ticketId,
      ticket: supportTicket
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ message: 'Error creating support ticket' });
  }
};

// --- Get Tickets List for User ---
exports.getTickets = async (req, res) => {
  try{
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
    return res.json(tickets);
  }catch(err){
    console.error(err);
    return res.json({error:"failed to fetch tickets"});
  }
};

// --- Get Ticket Details by ticketId ---
exports.getTicketById = async (req, res) => {
  const { ticketId } = req.params;
  if (!ticketId) return res.status(400).json({ error: "Missing ticketId" });
  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
};

/**
 * Close support ticket with notification
 */
exports.closeTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    ticket.status = 'resolved';
    ticket.closed = true;
    ticket.closedAt = new Date();
    
    await ticket.save();
    
    // Create notification for ticket closure
    try {
      if (ticket.userType === 'Student') {
        await createStudentNotification(
          ticket.userId,
          'Support Ticket Closed',
          `Your support ticket "${ticket.subject}" has been closed.`,
          {
            type: 'info',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Details'
          }
        );
      } else if (ticket.userType === 'College') {
        await createCollegeNotification(
          ticket.userId,
          'Support Ticket Closed',
          `Your support ticket "${ticket.subject}" has been closed.`,
          {
            type: 'info',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Details'
          }
        );
      } else if (ticket.userType === 'Company') {
        await createCompanyNotification(
          ticket.userId,
          'Support Ticket Closed',
          `Your support ticket "${ticket.subject}" has been closed.`,
          {
            type: 'info',
            category: 'system',
            actionUrl: `/support/ticket/${ticketId}`,
            actionText: 'View Details'
          }
        );
      }
    } catch (notificationError) {
      console.error('Error creating ticket closure notification:', notificationError);
      // Don't fail the ticket closure if notification fails
    }
    
    res.json({ message: 'Ticket closed successfully', ticket });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ message: 'Error closing ticket' });
  }
};