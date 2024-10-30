const Address = require("../models/Address");

class AddressController {
  //[GET] /address
  index(req, res) {
    Address.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] /address/id
  getByIdAccount(req, res) {
    const id = req.dataToken.id;

    Address.getByIdAccount(id, function (data) {
      res.json(data);
    });
  }

  //[GET] /address/id
  getByBill(req, res) {
    const id = req.params.id;
    Address.getByBill(id, function (data) {
      res.json(data);
    });
  }

  //[GET] /address/:id/get-by-account
  getAddressByAccount(req, res) {
    const id = req.params.id;

    Address.getByIdAccount(id, function (data) {
      res.json(data);
    });
  }
  //[GET] /address/:id/getone
  getById(req, res) {
    const id = req.params.id;

    Address.getById(id, function (data) {
      res.json(data);
    });
  }
  //[POST] / address/ create
  create(req, res, next) {
    const formData = req.body;
    formData.id_account = req.dataToken.id;

    Address.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / address/:id/ update
  update(req, res, next) {
    const id = req.params.id;

    const formData = req.body;

    Address.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[DELETE] / address/:id/ remove
  remove(req, res, next) {
    const id = req.params.id;

    Address.remove(id, function (data) {
      res.json(data);
    });
  }
}
module.exports = new AddressController();
