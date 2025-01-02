const express = require("express");
const { createPaymentVNPay, vnpayReturn } = require("../app/controllers/Payment");
const middleWareController = require("../app/controllers/MiddleWareController");
const router = express.Router();

router.post("/create-payment", middleWareController.verifyToken, createPaymentVNPay);
router.get("/vpn-return", vnpayReturn);
module.exports = router;
