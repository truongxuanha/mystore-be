const express = require('express')
const router = express.Router()

const newsController = require('../app/controllers/NewsController')
const middleWareController = require('../app/controllers/MiddleWareController')

router.get('/:slug/get-by-category', newsController.getBySlugCategory)

router.get('/get-by-slug/:slug', newsController.getBySlug)

router.get('/:id/get-by-id', middleWareController.verifyTokenAndAdminAuth, newsController.getById)

router.get('/get-by-admin', middleWareController.verifyTokenAndAdminAuth, newsController.getAllByAdmin)

router.post('/create', middleWareController.verifyTokenAndAdminAuth, newsController.create)

router.put('/:id/update', middleWareController.verifyTokenAndAdminAuth, newsController.update)

router.delete('/:id/remove', middleWareController.verifyTokenAndAdminAuth, newsController.remove)

module.exports = router
