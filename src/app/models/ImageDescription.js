const mysql = require("../../config/mysql_db");

const ImageDescription = function (imagedescription) {
  this.id = imagedescription.id;
  this.id_product = imagedescription.id_product;
  this.path_name = imagedescription.path_name;
};

ImageDescription.getAll = function (result) {
  mysql.query("SELECT * FROM `img_description`", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

ImageDescription.getByIdProduct = function (id, result) {
  mysql.query("SELECT * FROM `img_description` where id_product=?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

ImageDescription.create = function (formData, result) {
  mysql.query("INSERT INTO `img_description` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: data.insertId, ...formData } });
    }
  });
};

ImageDescription.remove = function (id, result) {
  mysql.query("DELETE FROM `img_description` WHERE `id` = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Xóa hình ảnh thành công!" });
    }
  });
};
module.exports = ImageDescription;
