const mysql = require("../../config/mysql_db");

const ProductCategory = function (category) {
  this.id = category.id;
  this.name = category.name;
};

ProductCategory.getAll = function (result) {
  mysql.query("SELECT * FROM product_categories", function (err, data) {
    if (err) {
      result({ status: false, data: err });
      return;
    }
    result({ status: true, data: data });
  });
};

module.exports = ProductCategory;
