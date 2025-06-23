const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// Middleware to ensure user is authenticated via session
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user && req.session.user.id) {
    return next();
  }
  res.status(401).json({ success: false, message: 'Not authenticated' });
}

// Generate portfolio route
router.get('/generate', ensureAuthenticated, portfolioController.generatePortfolio);

module.exports = router;