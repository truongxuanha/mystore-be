const mysql = require('../../config/mysql_db')

const Banner = function () {
}

Banner.getAll = function (result) {
  mysql.query("SELECT * FROM `banner`", function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: data })
    }
  })
}

Banner.create = function (formData, result) {
  mysql.query("INSERT INTO `banner` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: data })
    }
  })
}

Banner.update = function (id, formData, result) {
  mysql.query(
    "UPDATE `banner` SET ? WHERE id=?",
    [formData, id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        result({ status: true, data: { id: id, ...formData } });
      }
    }
  );
};

Banner.remove = function (id, result) {
  mysql.query("DELETE FROM `banner` WHERE `id`=?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Xóa dữ liệu thành công!" });
    }
  });
};

module.exports = Banner
