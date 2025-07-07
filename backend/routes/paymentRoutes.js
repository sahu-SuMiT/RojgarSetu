const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');

const Campus_INTERNAL_SECRET = process.env.CAMPUS_INTERNAL_SECRET;

router.post('/', async (req, res) => {
  console.log('--- PAYMENT WEBHOOK RECEIVED ---');
  console.log('Received payment update:', JSON.stringify(req.body, null, 2));
  console.log('------------------------');

  // Verify internal secret for security
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret !== Campus_INTERNAL_SECRET) {
    console.error('WEBHOOK SECURITY ALERT: Invalid internal secret!');
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Invalid internal secret.' 
    });
  }

  try {
    const {
      correlationId,
      payomatixId,
      status,
      message,
      amount,
      currency,
      customerEmail,
      customerName,
      customerPhone,
      receivedAt
    } = req.body;

    // Validate required fields
    if (!correlationId || !payomatixId || !status || !amount || !currency) {
      console.error('Missing required fields in webhook payload');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in webhook payload'
      });
    }

    // Log the payment update
    console.log(`Payment Update for User ${correlationId}:`);
    console.log(`- Status: ${status}`);
    console.log(`- Amount: ${amount} ${currency}`);
    console.log(`- Email: ${customerEmail}`);
    console.log(`- Payomatix ID: ${payomatixId}`);
    console.log(`- Correlation ID: ${correlationId}`);

    // Search for student by email and correlation ID
    let student = null;
    try {
      if (correlationId && mongoose.Types.ObjectId.isValid(correlationId)) {
        student = await Student.findById(correlationId);
      }
      if (!student && correlationId) {
        if (mongoose.Types.ObjectId.isValid(correlationId)) {
          student = await Student.findById(correlationId);
        }
      }
      if (student) {
        if (status === 'success' || status === 'completed') {
          await Student.findByIdAndUpdate(student._id, {
            payment: {
              status: 'paid',
              amount: amount,
              currency: currency,
              date: new Date(),
              payomatixTransactionId: payomatixId
            }
          });
        } else if (status === 'failed' || status === 'cancelled') {
          await Student.findByIdAndUpdate(student._id, {
            payment: {
              status: 'failed',
              failureReason: message
            }
          });
        }
      }
    } catch (dbError) {
      console.error('Error updating student payment status:', dbError);
    }

    res.status(200).json({
      success: true,
      message: 'Payment update processed successfully',
      receivedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error processing payment update',
      error: error.message
    });
  }
});

module.exports = router; 