const salePopupController = require("../app/controllers/SalePopupController");

const express = require("express");
const router = express.Router();

router.get("/get-popup-by-account", salePopupController.getPopupByAcc);

module.exports = router;
