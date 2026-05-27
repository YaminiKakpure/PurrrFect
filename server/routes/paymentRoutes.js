const express = require("express");
const router = express.Router();
const Payment = require("../controllers/paymentController");

router.post("/", Payment.createPayment);
router.get("/", Payment.getAllPayments);
router.get("/:id", Payment.getPaymentById);
router.put("/:id", Payment.updatePayment);
router.delete("/:id", Payment.deletePayment);

module.exports = router;
