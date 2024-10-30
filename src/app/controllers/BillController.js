const Bill = require("../models/Bill");

const mailer = require("../../until/mailer");

class BillController {
  //[GET] / bill/getByAccount
  getByAccount(req, res, next) {
    const id = req.dataToken.id;

    Bill.getByAccount(id, function (data) {
      res.json(data);
    });
  }

  //[GET] / bill/get-all
  getAllByAdmin(req, res, next) {
    var data = require("url").parse(req.url, true).query;
    const query = data.query || "";
    const status = data.status;
    const page = data.page;
    const itemInPage = data.item;
    Bill.getAllByAdmin(query, status, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[GET] / bill/status/:status
  getByStatus(req, res, next) {
    const status = req.params.status;
    const id = req.dataToken.id;

    Bill.getByStatus(status, id, function (data) {
      res.json(data);
    });
  }

  //[POST] / bill/create
  create(req, res, next) {
    const formData = req.body;
    formData.id_account = req.dataToken.id;

    Bill.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / bill/:id/update
  update(req, res, next) {
    const id = req.params.id;
    const formData = req.body;

    Bill.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / bill/:id/update-status
  updateStatus(req, res, next) {
    const id = req.params.id;
    let formData = req.body;
    const email = req.body.email;
    delete formData["email"];

    Bill.update(id, formData, function (data) {
      if (data.success === true) {
        if (formData.status == 1) {
          const sentMail = async () => {
            mailer.sentMail(
              email,
              "Order Status",
              `<h5>Xin chào</h5><p>Đơn hàng ${id} của bạn đã được xác nhận lúc ${formData.confirmAt}</p>
                      <p>Trân trọng!</p>
                      <p>Truy cập: ${process.env.APP_URL}/account Để theo dõi đơn hàng của bạn</p>
                      `
            );
          };
          sentMail();
        }
        if (formData.status == 2) {
          const sentMail = async () => {
            mailer.sentMail(
              email,
              "Order Status",
              `<h5>Xin chào</h5><p>Đơn hàng ${id} của bạn đã giao thành công lúc ${formData.paymentAt}</p>
                      <p>Cảm ơn quý khách đã tin tưởng và ủng hộ sản phẩm của chúng tôi, trân trọng!</p>
                      <p>Truy cập: ${process.env.APP_URL}/account Để theo dõi đơn hàng của bạn</p>
                      `
            );
          };
          sentMail();
        }
      }
      res.json(data);
    });
  }

  //[DELETE] //bill/:id/delete
  remove(req, res, next) {
    const id = req.params.id;

    Bill.remove(id, function (data) {
      res.json(data);
    });
  }

  //[DELETE] //bill/:id/delete-by-admin
  removeByAdmin(req, res, next) {
    const id = req.params.id;

    Bill.remove(id, function (data) {
      res.json(data);
    });
  }
}

module.exports = new BillController();
