const Banner = require("../models/Banner");

class BannerController {
  //[GET] /banner
  index(req, res) {
    Banner.getAll(function (data) {
      res.json(data);
    });
  }

  //[POST] /banner/create
  create(req, res) {
    const formData = req.body;
    Banner.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] /banner/:id/update
  update(req, res) {
    const id = req.params.id;
    const formData = req.body;

    Banner.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[DELETE] /banner/:id/remove
  remove(req, res) {
    const id = req.params.id;

    Banner.remove(id, function (data) {
      res.json(data);
    });
  }
}
module.exports = new BannerController();
