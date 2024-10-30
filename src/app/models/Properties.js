const mysql = require("../../config/mysql_db");

const Properties = function (properties) {
  this.id = properties.id;
  this.id_product = properties.id_product;
  this.cpu = properties.cpu_speed;
  this.ram = properties.ram;
  this.resolution = properties.resolution;
  this.w_l_t = properties.w_l_t;
  this.cpu_type = properties.cpu_type;
  this.screen_size = properties.screen_size;
  this.material = properties.material;
  this.battery = properties.battery;
  this.card = properties.card;
};

Properties.getAll = function (result) {
  mysql.query("SELECT * FROM `properties`", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Properties.getByIdProduct = function (id, result) {
  mysql.query("SELECT * FROM `properties` where id_product=?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Properties.create = function (formData, result) {
  mysql.query("INSERT INTO `properties` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: data.insertId, ...formData } });
    }
  });
};

Properties.update = function (id, formData, result) {
  mysql.query("UPDATE `properties` SET ? where id=?", [formData, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: id, ...formData } });
    }
  });
};

Properties.remove = function (id, result) {
  mysql.query("DELETE FROM `properties` WHERE `id` = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Xóa dữ liệu thành công!" });
    }
  });
};

Properties.addColumn = function (formData, result) {
  mysql.query(`ALTER TABLE properties add COLUMN ${formData.column_name} ${formData.data_type}`, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: `Thêm thành công cột ${formData.column_name}` });
    }
  });
};

Properties.dropColumn = function (formData, result) {
  mysql.query(`ALTER TABLE properties DROP COLUMN ${formData.column_name}`, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: `Xóa thành công cột ${formData.column_name}` });
    }
  });
};

module.exports = Properties;
