const Account = require("../models/Accounts");
const multer = require("multer");
const mailer = require("../../until/mailer");
const _JWT = require("../../until/_JWT");
require("dotenv/config");

class AccountController {
  //[GET] /account
  index(req, res) {
    var data = require("url").parse(req.url, true).query;
    const query = data.query ? data.query : "";
    const permission = data.permission;
    const page = data.page;
    const itemInPage = data.item;
    Account.getAll(query, permission, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[GET] /account/get-customer
  getAllCustomer(req, res) {
    var data = require("url").parse(req.url, true).query;
    const query = data.query ? data.query : "";

    const sex = data.sex;
    const page = data.page;
    const itemInPage = data.item;
    Account.getAllCustomer(query, sex, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/info
  getInfo(req, res) {
    const id = req.dataToken.id;

    Account.getInfo(id, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/register
  register(req, res) {
    const formData = req.body;
    Account.register(formData, function (data) {
      if (data.status === true) {
        const sentMail = async () => {
          mailer.sentMail(
            formData.email,
            "Register",
            `<h5>Xin chào</h5><p>Bạn đã đăng ký thành công tài khoản tại MyStore.</p>
          <p>Chúc quý khách có trải nghiệm tốt nhất. Trân trọng!</p>
          <p>Truy cập: ${process.env.APP_URL}</p>
          `
          );
        };
        sentMail(formData);
      }
      res.json(data);
    });
  }

  //[PUT] /account/update
  update(req, res) {
    const id = req.dataToken.id;

    const formData = req.body;

    Account.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[PATCH] /account/updateOne
  updateOne(req, res) {
    const id = req.dataToken.id;

    const formData = req.body;

    Account.updateOne(id, formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] /account/:id/update-by-id
  updateById(req, res) {
    const id = req.params.id;
    const formData = req.body;
    if (formData.birthday === "" || formData.birthday === null) {
      delete formData["birthday"];
    }
    delete formData["createAt"];
    delete formData["key"];
    delete formData["avatar"];
    delete formData["type"];
    delete formData["id"];
    Account.updateById(id, formData, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/login
  login(req, res) {
    const formData = req.body;
    Account.login(formData, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/refresh
  refresh(req, res) {
    const refreshToken = req.body.refresh;
    Account.refresh(refreshToken, function (data) {
      res.json(data);
    });
  }

  //[PATCH] /account/change-pass
  changepass(req, res) {
    const id = req.dataToken.id;

    const formData = req.body;

    Account.changePass(id, formData, function (data) {
      res.json(data);
    });
  }

  //[PATCH] /account/change_avatar
  changeAvatar(req, res) {
    const id = req.dataToken.id;

    const formData = req.body;

    Account.changeAvatar(id, formData, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/upload
  uploadFile(req, res) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "src/public/imgs/avatar");
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      }
    });

    const upload = multer({ storage }).single("file");

    upload(req, res, (error) => {
      if (error) {
        return res.status(500).json(error);
      } else {
        const id = req.dataToken.id;
        const formData = {
          avatar: req.file.filename
        };
        Account.update(id, formData, function (data) {
          res.json(data);
        });
      }
    });
  }

  //[POST] /account/create-by-admin
  createByAdmin(req, res) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "src/public/imgs/avatar");
      },
      filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
      }
    });
    const upload = multer({ storage }).single("file");

    upload(req, res, (error) => {
      if (error) {
        return res.status(500).json(error);
      } else {
        const formData = JSON.parse(req.body.data);
        formData.avatar = req.file ? req.file.filename : "";
        if (formData.birthday === "") {
          delete formData["birthday"];
        }

        formData.password = "Mystoreshop123#";
        delete formData["id"];
        Account.register(formData, function (data) {
          res.json(data);
        });
      }
    });
  }

  //[POST] /account/create-by-admin
  checkRequired(req, res) {
    const formData = req.body;
    Account.checkRequiredAccount(formData, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/firebase-login
  firebaseLogin(req, res) {
    const formData = req.body;
    Account.firebaseLogin(formData, function (data) {
      res.json(data);
    });
  }

  //[POST] /account/forgot-password
  forgotPassword(req, res) {
    const formData = req.body;
    Account.VerifyEmail(formData, function (data) {
      if (data.status === true) {
        const sentMail = async (formData) => {
          const token = await _JWT.makeMailer(formData.email);
          mailer.sentMail(
            formData.email,
            "Verify Email",
            `<h5>Xin chào</h5><p>Chúng tôi nhận được yêu cầu thiết lập lại mật khẩu tài khoản MyStore của bạn.</p>
          <p>Nhấn <a href="${process.env.APP_URL}/login?token=${token}&email=${formData.email}">
          tại đây
          </a> để chuyển hướng đến trang đổi mật khẩu của bạn</p>
          <p>Hoặc dán đoạn mã [${process.env.APP_URL}/login?token=${token}&email=${formData.email}] vào thanh địa chỉ trình duyệt.</p>
          `
          );
          res.json({ status: true, data: "Một email xác thực đã được gửi đến bạn, vui lòng kiểm tra email của bạn!" });
        };
        sentMail(formData);
      } else {
        res.json(data);
      }
    });
  }
  //[POST] /account/reset-password
  resetPassword(req, res) {
    const formData = req.body;
    Account.resetPassword(formData, function (data) {
      if (data.status === true) {
        mailer.sentMail(
          formData.email,
          "Reset Password",
          `<h5>Xin chào</h5>
        <p>Mật khẩu tài khoản MyStore  của bạn đã được thay đổi vào lúc: ${formData.dateTime}</p>
        <p>Truy cập: ${process.env.APP_URL}</p>
        `
        );
      }
      res.json(data);
    });
  }

  //[DELETE] /account/:id/remove
  remove(req, res) {
    const id = req.params.id;

    Account.remove(id, function (data) {
      res.json(data);
    });
  }
}
module.exports = new AccountController();
