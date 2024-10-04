const _JWT = require('../../until/_JWT')

const middleWareController = {
    verifyToken: async (req, res, next) => {
        const token = req.headers.token
        if (token) {
            try {
                const dataVerify = await _JWT.verify(token)
                req.dataToken = dataVerify.data
                next()
            }
            catch (err) {
                res.status(401).json("Token is not valid!")
            }
        } else {
            res.status(401).json("Token does not exist!")
        }
    },

    verifyTokenAndAdminAuth: async (req, res, next) => {
        const token = req.headers.token
        if (token) {
            try {
                const dataVerify = await _JWT.verify(token)
                if (dataVerify.data.permission === 0 || dataVerify.data.permission === 2) {
                    req.dataToken = dataVerify.data
                    next()
                } 
                else {
                    res.status(401).json("You are not admin!")
                }
            }
            catch (err) {
                res.status(401).json("Token is not valid!")
            }
        } else {
            res.status(401).json("Token does not exist!")
        }
    },
    verifyTokenForgotPass: async (req, res, next) => {
        const token = req.headers.token
        const email = req.body.email
        if (token) {
            try {
                const dataVerify = await _JWT.verifyMailer(token)
                if (email == dataVerify.data)
                    next()
                else {
                    res.status(401).json("Token is not valid!")
                }
            }
            catch (err) {
                res.status(401).json("Token is not valid!")
            }
        } else {
            res.status(401).json("Token does not exist!")
        }
    },
}
module.exports = middleWareController