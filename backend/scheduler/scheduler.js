const cron = require('node-cron');
const ticket = require('../models/SupportTicket');
const Managerticket = require('../models/manager_ticket');

cron.schedule('0 */1 * * *', async () => { // runs every hour
  console.log("Running ticket check...");

  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  try {
    const ticketsToEscalate = await ticket.find({
      status: { $ne: 'resolved' },
      createdAt: { $lte: fortyEightHoursAgo },
      escalatedToManager: { $ne: true }
    });

    for (const ticket of ticketsToEscalate) {
      await Managerticket.create(ticket);

      // Optionally mark original as escalated
      ticket.escalatedToManager = true;
      await ticket.save();
    }

    console.log(`Escalated ${ticketsToEscalate.length} tickets.`);
  } catch (err) {
    console.error("Error during escalation:", err);
  }
});

module.exports = startComplaintEscalationJob;
    