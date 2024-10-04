const express = require('express')
const router = express.Router()

const newsCategoryController = require('../app/controllers/NewsCategoryController')
const middleWareController = require('../app/controllers/MiddleWareController')

router.get('/', newsCategoryController.getAll)

router.get('/get-all-by-admin', middleWareController.verifyTokenAndAdminAuth, newsCategoryController.getAllByAdmin)

router.post('/create', middleWareController.verifyTokenAndAdminAuth, newsCategoryController.create)

router.put('/:id/update', middleWareController.verifyTokenAndAdminAuth, newsCategoryController.update)

router.delete('/:id/remove', middleWareController.verifyTokenAndAdminAuth, newsCategoryController.remove)

module.exports = router
