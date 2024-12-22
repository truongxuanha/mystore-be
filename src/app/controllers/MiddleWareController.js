const _JWT = require("../../until/_JWT");
const Account = require("../models/Accounts");
const { OTPRequest, findValidOTP } = require("../models/Accounts");

const middleWareController = {
  verifyToken: async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      try {
        const dataVerify = await _JWT.verify(token);
        req.dataToken = dataVerify.data;
        next();
      } catch (err) {
        res.status(401).json("Token is not valid!");
      }
    } else {
      res.status(401).json("Token does not exist!");
    }
  },

  verifyTokenAndAdminAuth: async (req, res, next) => {
    const token = req.headers.token;
    if (token) {
      try {
        const dataVerify = await _JWT.verify(token);
        if (dataVerify.data.permission === 1 || dataVerify.data.permission === 2) {
          req.dataToken = dataVerify.data;
          next();
        } else {
          res.status(401).json("You are not admin!");
        }
      } catch (err) {
        res.status(401).json("Token is not valid!");
      }
    } else {
      res.status(401).json("Token does not exist!");
    }
  },
  verifyTokenForgotPass: async (req, res, next) => {
    const token = req.headers.token;
    const email = req.body.email;
    if (token) {
      try {
        const dataVerify = await _JWT.verifyMailer(token);
        if (email == dataVerify.data) next();
        else {
          res.status(401).json("Token is not valid!");
        }
      } catch (err) {
        res.status(401).json("Token is not valid!");
      }
    } else {
      res.status(401).json("Token does not exist!");
    }
  },
  verifyOTPMiddleware: (req, res, next) => {
    const { otp, email } = req.body;
    Account.findValidOTP(email, otp, (err, validOTP) => {
      if (err) {
        return res.status(500).json({ status: false, message: "Lỗi khi kiểm tra OTP." });
      }
      if (!validOTP) {
        return res.status(400).json({ status: false, message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
      }

      next();
    });
  }
};
module.exports = middleWareController;
