const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SupportTicket = require("../models/SupportTicket");
const Notification = require("../models/Notification");

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
  await Notification.create({ userId, message: text, timestamp: new Date(), read: false });
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

// --- Create Support Ticket ---
exports.createTicket = async (req, res) => {
  const { userId, userType, subject, description, email, category, priority } = req.body;

  if (!userId || !userType || !subject || !description || !email) {
    return res.status(400).json({ error: "All fields required: userId, userType, subject, description, email" });
  }
  if (!['college', 'company'].includes(userType)) {
    return res.status(400).json({ error: "userType must be 'college' or 'company'" });
  }

  const ticketId = generateTicketId();
  const secretCode = generateSecretCode();

  // Initial message in the conversation thread
  const initialMessage = {
    sender: userId,
    senderType: "user",
    message: description,
    timestamp: new Date(),
    isBotResponse: false
  };

  const ticket = new SupportTicket({
    ticketId,
    userId,
    userType,
    subject,
    status: "open",
    priority: priority || "medium",
    category: category || "general",
    messages: [initialMessage],
    secretCode,
    email
  });

  await ticket.save();

  // Automated message
  const autoMsg = `Your Ticket No. #${ticketId} has been generated for [${subject}]. Your issue will be resolved within 3–4 hours. Please use this secret code: ${secretCode} to close your complaint after resolution.`;

  // Send notifications
  await sendPortalNotification(userId, autoMsg);
  await sendEmail(email, `Ticket #${ticketId} Generated`, autoMsg);

  return res.json({ ticketId, message: autoMsg });
};

// --- Get Tickets List for User ---
exports.getTickets = async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const tickets = await SupportTicket.find({ userId }).sort({ createdAt: -1 });
  return res.json(tickets);
};

// --- Get Ticket Details by ticketId ---
exports.getTicketById = async (req, res) => {
  const { ticketId } = req.params;
  if (!ticketId) return res.status(400).json({ error: "Missing ticketId" });
  const ticket = await SupportTicket.findOne({ ticketId });
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });
  res.json(ticket);
};

// --- Close Ticket (with secret code) ---
exports.closeTicket = async (req, res) => {
  try{
    const { ticketId, secretCode } = req.body; console.log("req.body: ", req.body);
    if (!ticketId || !secretCode) {
      return res.status(400).json({ error: "ticketId and secretCode required" });
    }
    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.SecretCode && ticket.secretCode !== secretCode) {
      return res.status(401).json({ error: "Incorrect secret code" });
    }
    if (ticket.status === "closed" || ticket.status === "resolved") {
      return res.status(400).json({ error: "Ticket already closed/resolved" });
    }
    ticket.status = "resolved";
    ticket.closed = true;
    ticket.closedAt = new Date();
    await ticket.save();

    await Notification.create({
      sender:req.body.userId,
      senderModel: req.body.senderModel,
      recipient:req.body.userId,
      recipientModel: req.body.recipientModel,
      title: req.body.title,
      message:req.body.message,
      type: 'success',
      priority: 'normal',
      
    })
    await sendEmail(ticket.email, `Ticket #${ticket.ticketId} Closed`, `Your ticket #${ticket.ticketId} has been closed. Thank you!`);

    res.json({ message: "Ticket closed successfully" });
  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"Failed to Create Ticket", err})
  }
};