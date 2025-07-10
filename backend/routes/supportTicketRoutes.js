const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportControlller");

// Create a new support ticket
router.post("/", supportController.createTicket);

// Get tickets for a user (user query param)
router.get("/", supportController.getTickets);


// Close a ticket with secret code
router.post("/close", supportController.closeTicket);

// Get details of a single ticket
router.get("/:ticketId", supportController.getTicketById);


module.exports = router;