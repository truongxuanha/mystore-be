const Manufacturers = require("../models/Manufacturer");

const { createSlug } = require("../../until/slug");
const { uploadToFirebase } = require("../../until/uploadToFirebase");

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
  async create(req, res, next) {
    const formData = req.body;
    formData.slug = createSlug(req.body.name);

    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file upload!" });
    }
    try {
      const publicUrl = await uploadToFirebase(req.file, "public/image_description");
      const newData = {
        ...formData,
        img: publicUrl
      };
      Manufacturers.create(newData, function (data) {
        res.json(data);
      });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  //[PUT] / manufacturer/:id/ update
  async update(req, res, next) {
    const id = req.params.id;

    const formData = req.body;
    formData.slug = createSlug(req.body.name);
    if (req.file) {
      try {
        const publicUrl = await uploadToFirebase(req.file, "public/image_description");
        const newData = {
          ...formData,
          img: publicUrl
        };
        Manufacturers.create(newData, function (data) {
          res.json(data);
        });
      } catch (error) {
        res.status(500).json({ status: false, message: error.message });
      }
    } else {
      Manufacturers.update(id, formData, function (data) {
        res.json(data);
      });
    }
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
