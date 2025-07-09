const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");

// Create a new support ticket
router.post("/tickets", supportController.createTicket);

// Get tickets for a user (user query param)
router.get("/tickets", supportController.getTickets);

// Get details of a single ticket
router.get("/tickets/:ticketId", supportController.getTicketById);

// Close a ticket with secret code
router.post("/tickets/close", supportController.closeTicket);

module.exports = router;