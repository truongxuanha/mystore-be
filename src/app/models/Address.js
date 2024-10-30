const mysql = require("../../config/mysql_db");

const Address = function (address) {
  this.id = address.id;
  this.id_account = address.id_account;
  this.full_name = address.full_name;
  this.phone = address.phone;
  this.detail_address = address.detail_address;
  this.province = address.province;
  this.district = address.district;
  this.wards = address.wards;
};

Address.getAll = function (result) {
  mysql.query("SELECT * FROM `address`", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Address.getByIdAccount = function (id_account, result) {
  mysql.query("SELECT * FROM `address`where id_account=? ", id_account, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Address.getById = function (id, result) {
  mysql.query("SELECT * FROM `address`where id=? ", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Address.getByBill = function (id, result) {
  mysql.query(
    "SELECT address.id, address.full_name, address.phone, address.detail_address, address.province, address.district, address.wards FROM address,bill WHERE address.id = bill.id_address AND bill.id = ? ",
    id,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        result({ status: true, data: data });
      }
    }
  );
};

Address.create = function (formData, result) {
  mysql.query("INSERT INTO `address` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: data.insertId, ...formData } });
    }
  });
};

Address.update = function (id, formData, result) {
  mysql.query("UPDATE `address` SET ? WHERE id=?", [formData, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: id, ...formData } });
    }
  });
};

Address.remove = function (id, result) {
  const deleteAddress = () => {
    mysql.query("DELETE FROM `address` WHERE `id` = ?", id, function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        result({ status: true, data: `Xóa dữ liệu thành công !` });
      }
    });
  };
  mysql.query("SELECT * FROM `bill`  WHERE `id_address` = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      if (data.length > 0) {
        result({ status: false, data: "Địa chỉ đang được sử dụng để đặt hàng, không thể xóa!" });
      } else {
        deleteAddress();
      }
    }
  });
};

module.exports = Address;
