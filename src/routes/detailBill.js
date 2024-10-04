const express = require('express')
const router = express.Router()

const detailBillController = require('../app/controllers/DetailBillController')
const middleWareController = require('../app/controllers/MiddleWareController')

router.get('/', detailBillController.index)

router.get('/:id/get-by-bill', middleWareController.verifyTokenAndAdminAuth, detailBillController.getByIdBill)

router.get('/get-by-account', middleWareController.verifyToken, detailBillController.getByIdAccount)

router.post('/:type/create', middleWareController.verifyToken, detailBillController.create)

module.exports = router
