const ProductCategory = require("../models/ProductCategory");

class ProductCategoryController {
  getAllCagegory(req, res, next) {
    ProductCategory.getAll(function (data) {
      res.json(data);
    });
  }
}
module.exports = new ProductCategoryController();
