const Razorpay = require('razorpay');
const db = require('../config/db');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const Payment = {
  createOrder: async (amount) => {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      };

      const order = await new Promise((resolve, reject) => {
        razorpay.orders.create(options, (err, order) => {
          if (err) reject(err);
          else resolve(order);
        });
      });

      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  },

  verifyPayment: async (paymentId, orderId, signature) => {
    try {
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  recordPayment: async (providerId, amount, paymentId, orderId) => {
    const connection = await db.getConnection();
    try {
      await connection.query(
        `INSERT INTO payments 
        (provider_id, amount, payment_id, order_id, status) 
        VALUES (?, ?, ?, ?, 'completed')`,
        [providerId, amount, paymentId, orderId]
      );
    } catch (error) {
      console.error('Error recording payment:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Payment;