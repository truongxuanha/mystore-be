const express = require('express')
const router = express.Router()


const revenueController = require("../app/controllers/RevenuesController")


router.get('/', revenueController.getRevenueMonth)

module.exports = router