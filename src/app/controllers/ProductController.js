const Products = require("../models/Products");

const { createSlug } = require("../../until/slug");
const bucket = require("../../config/firebase/firebaseAdmin");
class ProductController {
  //[GET] / product
  index(req, res, next) {
    Products.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] / product/get-all
  getAllByAdmin(req, res, next) {
    var data = require("url").parse(req.url, true).query;
    const query = data.query || "";
    // prettier-ignore
    const sort = data.sort || "";
    const page = data.page || "";
    const idManu = data.manufacturer || "";
    const itemInPage = data.item || "";
    const category = data.category || "";
    Products.getAllByAdmin(query, sort, idManu, page, itemInPage, category, function (data) {
      res.json(data);
    });
  }

  //[GET] / product/ :slug
  getBySlug(req, res, next) {
    const slug = req.params.slug;

    Products.getBySlug(slug, function (data) {
      res.json(data);
    });
  }

  //[GET] / product/ :id/getone
  getById(req, res, next) {
    const id = req.params.id;

    Products.getById(id, function (data) {
      res.json(data);
    });
  }

  //[GET] / product/ :idManufacture
  getBySlugManu(req, res, next) {
    const slug = req.params.slug;
    var data = require("url").parse(req.url, true).query;
    const min = data.min;
    const max = data.max;
    const sort = data.sort;
    const page = data.page;
    const itemInPage = data.item;

    Products.getBySlugManu(slug, min, max, sort, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[GET] / product/ random
  getRandom(req, res, next) {
    Products.getRandom(function (data) {
      res.json(data);
    });
  }

  //[GET] / product/search
  search(req, res, next) {
    var data = require("url").parse(req.url, true).query;
    const query = data.q;
    const min = data.min;
    const max = data.max;
    const sort = data.sort;
    const page = data.page;
    const itemInPage = data.item;

    Products.search(query, min, max, sort, page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[GET] / product
  getBigSale(req, res, next) {
    Products.getBigSaleProduct(function (data) {
      res.json(data);
    });
  }

  //[GET] / product
  getNewProduct(req, res, next) {
    Products.getNewProduct(function (data) {
      res.json(data);
    });
  }

  //[GET] / product/hotproduct
  getHotroduct(req, res, next) {
    Products.getHotProduct(function (data) {
      res.json(data);
    });
  }

  //[POST] / product / create

  create(req, res) {
    const formData = req.body;
    formData.slug = createSlug(formData.name);

    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded." });
    }

    const filePath = `public/${req.file.originalname}`;
    const blob = bucket.file(filePath);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });
    blobStream.on("error", (err) => {
      return res.status(500).json({ status: false, data: err });
    });
    blobStream.on("finish", () => {
      const encodedBlobName = encodeURIComponent(blob.name);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedBlobName}?alt=media`;
      formData.thumbnail = publicUrl;
      Products.create(formData, function (data) {
        res.json(data);
      });
    });

    blobStream.end(req.file.buffer);
  }

  //[PUT] / product / :id / update
  update(req, res) {
    const id = req.params.id;
    const formData = req.body;

    formData.slug = createSlug(formData.name);

    if (req.file) {
      const filePath = `public/${req.file.originalname}`;
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      blobStream.on("error", (err) => {
        return res.status(500).json({ status: false, data: err });
      });

      blobStream.on("finish", () => {
        const encodedBlobName = encodeURIComponent(blob.name);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedBlobName}?alt=media`;

        formData.thumbnail = publicUrl;

        Products.update(id, formData, function (data) {
          res.json(data);
        });
      });

      blobStream.end(req.file.buffer);
    } else {
      Products.update(id, formData, function (data) {
        res.json(data);
      });
    }
  }

  //[DELETE] / product / :id / remove
  remove(req, res) {
    const id = req.params.id;

    Products.remove(id, function (data) {
      res.json(data);
    });
  }

  //[PATCH] / product / :id / update-quantity
  updateQuantity(req, res) {
    const formData = req.body;

    Products.updateQuantity(formData, function (data) {
      res.json(data);
    });
  }
}
module.exports = new ProductController();
