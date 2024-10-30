const Cart = require("../models/Cart");

class CartController {
  //[GET] / cart/getByAccount
  getByAccount(req, res, next) {
    const id = req.dataToken.id;

    Cart.getByAccount(id, function (data) {
      res.json(data);
    });
  }

  //[POST] / cart/create
  create(req, res, next) {
    const formData = req.body;
    formData.map((item) => {
      item.id_account = req.dataToken.id;
    });
    Cart.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / cart/:id/update
  update(req, res, next) {
    const id = req.params.id;
    const formData = req.body;

    Cart.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[PATCH] / cart/:id/update
  updateAddQuantity(req, res, next) {
    const id = req.params.id;
    const formData = req.body;

    Cart.updateAddQuantity(id, formData, function (data) {
      res.json(data);
    });
  }

  //[DELETE] / cart/:id/remove
  remove(req, res, next) {
    const id = req.params.id;

    Cart.remove(id, function (data) {
      res.json(data);
    });
  }
}

module.exports = new CartController();
