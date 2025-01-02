const DetailBill = require("../models/DetailBill");

class DetailBillController {
  //[GET] / detailBill
  index(req, res, next) {
    DetailBill.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] / detailBill/getByIdBii
  getByIdAccount(req, res, next) {
    const id = req.dataToken.id;
    const { status } = req.query;
    DetailBill.getByIdAccount(id, status, function (data) {
      res.json(data);
    });
  }

  //[GET] / detailBill/getByIdBii
  getByIdBill(req, res, next) {
    const id = req.params.id;

    DetailBill.getByIdBill(id, function (data) {
      res.json(data);
    });
  }

  //[POST] / detailBill/create
  create(req, res, next) {
    try {
      const formData = req.body;
      const type = req.params.type;
      const id = req.dataToken.id;
      formData.billData.id_account = id;
      if (!formData || formData.length === 0) {
        res.status(400).json({
          success: false,
          message: "Missing required field: formData"
        });
        return;
      }

      DetailBill.create(formData.billData, formData.detailsData, type, function (data) {
        if (data.success) {
          res.status(200).json(data);
        } else {
          res.status(500).json({
            success: false,
            message: "Failed to create detail bill",
            error: data.data
          });
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DetailBillController();
