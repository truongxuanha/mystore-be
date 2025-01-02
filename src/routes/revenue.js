const express = require("express");
const router = express.Router();

const revenueController = require("../app/controllers/RevenuesController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/", middleWareController.verifyTokenAndAdminAuth, revenueController.getRevenueMonth);
router.get("/statictical", middleWareController.verifyTokenAndAdminAuth, revenueController.getStatistical);
router.get("/recent-order", middleWareController.verifyTokenAndAdminAuth, revenueController.getRecentOrders);

module.exports = router;
