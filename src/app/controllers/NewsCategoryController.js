const NewsCategory = require("../models/NewsCategory");

var slugify = require("slugify");

class NewsCategoryController {
  //[GET] / news-category
  getAll(req, res, next) {
    NewsCategory.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] / news-category/get-all-by-admin
  getAllByAdmin(req, res, next) {
    var data = require("url").parse(req.url, true).query;
    const page = data.page;
    const itemInPage = data.item;
    NewsCategory.getAllByAdmin(page, itemInPage, function (data) {
      res.json(data);
    });
  }

  //[POST] / news-category / create
  create(req, res) {
    const formData = req.body;
    formData.slug = slugify(formData.name, {
      replacement: "-",
      remove: undefined,
      lower: false,
      strict: false,
      locale: "vi",
      trim: true
    });

    NewsCategory.create(formData, function (data) {
      res.json(data);
    });
  }

  //[PUT] / news-category  / :id / update
  update(req, res) {
    const id = req.params.id;
    const formData = req.body;

    formData.slug = slugify(formData.name, {
      replacement: "-",
      remove: undefined,
      lower: false,
      strict: false,
      locale: "vi",
      trim: true
    });

    NewsCategory.update(id, formData, function (data) {
      res.json(data);
    });
  }

  //[DELETE] / news-category / :id / remove
  remove(req, res) {
    const id = req.params.id;

    NewsCategory.remove(id, function (data) {
      res.json(data);
    });
  }
}
module.exports = new NewsCategoryController();
