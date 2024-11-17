const mysql = require("../../config/mysql_db");

const Cart = function () {};

Cart.getByAccount = function (idAccount, result) {
  mysql.query(
    "SELECT * FROM cart LEFT JOIN( SELECT products.id as product_id, products.name as product_name, products.slug, products.id_manu, products.thumbnail, products.price, products.discount, products.other_discount, products.description, IFNULL(products.quantity - IFNULL(b.dtb_quantity,0), 0) as total_quantity FROM products LEFT JOIN (SELECT detail_bill.id_product as dtb_id_product, SUM(detail_bill.quantity) as dtb_quantity FROM detail_bill, bill WHERE detail_bill.id_bill = bill.id AND bill.status < 3 GROUP BY detail_bill.id_product) as b ON products.id = b.dtb_id_product) as c ON cart.id_product = c.product_id WHERE cart.id_account = ? ",
    idAccount,
    function (err, data) {
      if (err) {
        result({ success: false, data: err });
      } else {
        result({ success: true, data: data });
      }
    }
  );
};

Cart.create = function (formData, result) {
  const createCart = (query) => {
    mysql.query("INSERT INTO `cart` VALUES" + query.slice(0, -1), function (err, data) {
      if (err) {
        result({ success: false, data: err });
      } else {
        mysql.query(
          `SELECT * FROM cart LEFT JOIN( SELECT products.id as product_id, products.name as product_name, products.slug, products.id_manu, products.thumbnail, products.price, products.discount, products.other_discount, products.description, IFNULL(products.quantity - IFNULL(b.dtb_quantity,0), 0) as total_quantity FROM products LEFT JOIN (SELECT detail_bill.id_product as dtb_id_product, SUM(detail_bill.quantity) as dtb_quantity FROM detail_bill, bill WHERE detail_bill.id_bill = bill.id AND bill.status < 3 GROUP BY detail_bill.id_product) as b ON products.id = b.dtb_id_product) as c ON cart.id_product = c.product_id WHERE cart.id_account = '${formData[0].id_account}'`,
          function (err, data) {
            if (err) {
              result({ success: false, data: err });
            } else {
              result({ success: true, data: data });
            }
          }
        );
      }
    });
  };

  let query = "";
  formData.map((item) => {
    query = query + `(NULL, '${item.id_account}', '${item.id_product}', '${item.createAt}', NULL,'${item.quantity}' ),`;
  });
  createCart(query);
};

Cart.update = function (id, formData, result) {
  mysql.query("UPDATE `cart` SET ? where id=?", [formData, id], function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      result({ success: true, data: formData });
    }
  });
};

Cart.updateAddQuantity = function (id, formData, result) {
  mysql.query(`UPDATE cart SET quantity = quantity + ${formData.quantity} where id='${id}'`, function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      result({ success: true, data: formData });
    }
  });
};

Cart.remove = function (id, result) {
  mysql.query("DELETE FROM `cart` WHERE id =?", id, function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      result({ success: true, data: "Xóa thành công!" });
    }
  });
};

module.exports = Cart;
