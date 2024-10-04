const { reject } = require('bcrypt/promises')
const jwt = require('jsonwebtoken')
const _APP = require('./_APP')

//make token

let make = function (user) {
    return new Promise(function (resolve, reject) {
        jwt.sign({ data: user }, _APP.ACCESS_TOKEN, {
            algorithm: "HS256",
            expiresIn: _APP.TOKEN_TIME_LIFE
        },
            function (err, _token) {
                if (err) return reject(err)
                else return resolve(_token)
            }
        )
    })
}

let refresh = function (user) {
    return new Promise(function (resolve, reject) {
        jwt.sign({ data: user }, _APP.ACCESS_TOKEN_REFRESH, {
            algorithm: "HS256",
            expiresIn: _APP.TOKEN_TIME_LIFE_REFRESH
        },
            function (err, _token) {
                if (err) return reject(err)
                else return resolve(_token)
            }
        )
    })
}

let makeMailer = function (user) {
    return new Promise(function (resolve, reject) {
        jwt.sign({ data: user }, _APP.ACCESS_TOKEN_MAILER, {
            algorithm: "HS256",
            expiresIn: _APP.TOKEN_TIME_LIFE_MAILER
        },
            function (err, _token) {
                if (err) return reject(err)
                else return resolve(_token)
            }
        )
    })
}

//verify
let verify = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, _APP.ACCESS_TOKEN, function (err, data) {
            if (err) {
                return reject(err)
            }
            else {
                return resolve(data)
            }
        })
    })
}

let verifyRefresh = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, _APP.ACCESS_TOKEN_REFRESH, function (err, data) {
            if (err) {
                return reject(err)
            }
            else {
                return resolve(data)
            }
        })
    })
}


let verifyMailer = function (token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, _APP.ACCESS_TOKEN_MAILER, function (err, data) {
            if (err) {
                return reject(err)
            }
            else {
                return resolve(data)
            }
        })
    })
}

module.exports = {
    make: make,
    refresh: refresh,
    makeMailer: makeMailer,
    verify: verify,
    verifyRefresh: verifyRefresh,
    verifyMailer: verifyMailer
}
