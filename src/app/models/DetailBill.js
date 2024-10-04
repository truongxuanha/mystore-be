const mysql = require("../../config/mysql_db");

const DetailBill = (DetailBill) => {
  this.id = DetailBill.id;
  this.id_bill = DetailBill.id_bill;
  this.id_product = DetailBill.id_product;
  this.quantity = DetailBill.quantity;
};
DetailBill.getAll = function (result) {
  mysql.query("SELECT * FROM `detail_bill`", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }


  });
};

DetailBill.create = function (formData, type, result) {
  const deleteItemInCart = (query) => {
    mysql.query(
      "DELETE FROM cart WHERE id IN " + query.slice(0, -1) + ')', function (err, data) {
        if (err) {
          result({ Success: false, data: err });
        }
        else {
          result({ Success: true });
        }


      }

    );
  }

  let query = ''
  formData.map(item => {
    query = query + `(NULL, '${item.id_bill}', '${item.id_product}', '${item.quantity}' ),`
  })
  const mysqlQuery = "INSERT INTO `detail_bill` VALUES" + query.slice(0, -1)
  mysql.query(
    mysqlQuery,
    function (err, data) {
      if (err) {
        result({ Success: false, Message: err });
      } else {
        let queryCart = '('
        formData.map(item => {
          queryCart = queryCart + `${item.id},`
        })
        if (type === 'buy-now') {
          result({ Success: true, data: 'buy now success!' });
        }
        if (type === 'buy-from-cart') {
          deleteItemInCart(queryCart)
        }
      }


    }
  );
};

DetailBill.getByIdAccount = function (id, result) {
  mysql.query(
    "SELECT products.id, products.`name`, products.thumbnail, products.price, products.discount, products.other_discount, detail_bill.quantity, products.slug, bill.id as id_bill FROM products, detail_bill, bill WHERE detail_bill.id_bill = bill.id AND detail_bill.id_product = products.id AND bill.id_account = ?",
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

DetailBill.getByIdBill = function (id, result) {
  mysql.query(
    "SELECT products.name, products.thumbnail,detail_bill.id_product, products.price, detail_bill.quantity, products.discount, products.other_discount FROM detail_bill, products WHERE detail_bill.id_product = products.id AND detail_bill.id_bill = ?",
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


module.exports = DetailBill;
