const express = require('express')
const router = express.Router()

const middleWareController = require('../app/controllers/MiddleWareController')
const accountController = require('../app/controllers/AccountController')

router.post('/register', accountController.register)

router.post('/login', accountController.login)

router.put('/:id/update-by-id', middleWareController.verifyTokenAndAdminAuth, accountController.updateById)

router.delete('/:id/remove', middleWareController.verifyTokenAndAdminAuth, accountController.remove)

router.put('/update', middleWareController.verifyToken, accountController.update)

router.patch('/update_one', middleWareController.verifyToken, accountController.updateOne)

router.get('/info', middleWareController.verifyToken, accountController.getInfo)

router.post('/refresh', accountController.refresh)

router.patch('/change-pass', middleWareController.verifyToken, accountController.changepass)

router.patch('/change-avatar', middleWareController.verifyToken, accountController.changeAvatar)

router.get('/get-all', middleWareController.verifyTokenAndAdminAuth, accountController.index)

router.get('/get-all-customer', middleWareController.verifyTokenAndAdminAuth, accountController.getAllCustomer)

router.post('/upload', middleWareController.verifyToken, accountController.uploadFile)

router.post('/create', middleWareController.verifyTokenAndAdminAuth, accountController.createByAdmin)

router.post('/check-required', middleWareController.verifyTokenAndAdminAuth, accountController.checkRequired)

router.post('/firebase-login', accountController.firebaseLogin)

router.post('/forgot-password', accountController.forgotPassword)

router.post('/reset-password', middleWareController.verifyTokenForgotPass, accountController.resetPassword)


module.exports = router
