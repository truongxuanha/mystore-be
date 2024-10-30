const Manufacturers = require("../models/Manufacturer");

const { createSlug } = require("../../until/slug");

class ManufacturerController {
  //[GET] / manufacturer
  getAll(req, res, next) {
    Manufacturers.getAll(function (data) {
      res.json(data);
    });
  }
  //[GET] / manufacturer/get-all
  getAllByAdmin(req, res, next) {
    var data = require("url").parse(req.url, true).query;
    const query = data.query || "";
    const page = data.page;
    const itemInPage = data.item;
    Manufacturers.getAllByAdmin(query, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[GET] / manufacturer/:id
  getById(req, res, next) {
    const id = req.params.id;

    Manufacturers.getById(id, function (data) {
      res.json(data);
    });
  }

  //[GET] / manufacturer/:slug
  getBySlug(req, res, next) {
    const slug = req.params.slug;

    Manufacturers.getBySlug(slug, function (data) {
      res.json(data);
    });
  }

  //[POST] / manufacturer/ create
  create(req, res, next) {
    const formData = req.body;
    formData.slug = createSlug(req.body.name);

    Manufacturers.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / manufacturer/:id/ update
  update(req, res, next) {
    const id = req.params.id;

    const formData = req.body;
    formData.slug = createSlug(req.body.name);

    Manufacturers.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[DELETE] / manufacturer/ id / remove
  remove(req, res, next) {
    const id = req.params.id;

    Manufacturers.remove(id, function (data) {
      res.json(data);
    });
  }
}
module.exports = new ManufacturerController();
