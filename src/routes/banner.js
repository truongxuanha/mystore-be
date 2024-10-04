const express = require('express')
const router = express.Router()

const bannerController = require('../app/controllers/BannerController')
const middleWareController = require('../app/controllers/MiddleWareController')

router.put('/:id/update', middleWareController.verifyTokenAndAdminAuth, bannerController.update)

router.delete('/:id/remove', middleWareController.verifyTokenAndAdminAuth, bannerController.remove)

router.post('/create', middleWareController.verifyTokenAndAdminAuth, bannerController.create)

router.get('/', bannerController.index)

module.exports = router