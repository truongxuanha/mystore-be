const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");
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

DetailBill.create = function (billData, detailsData, type, result) {
  if (!billData.total_amount_order) {
    result({ success: false, data: "Missing required field: total_amount_order" });
    return;
  }
  mysql.getConnection((err, connection) => {
    if (err) {
      result({ success: false, data: err });
      return;
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        result({ success: false, data: err });
        return;
      }
      connection.query("SELECT id FROM address WHERE id = ?", [billData.id_address], (err, addressResult) => {
        if (err) {
          connection.rollback(() => {
            connection.release();
            result({ success: false, data: err });
          });
          return;
        }

        if (addressResult.length === 0) {
          connection.rollback(() => {
            connection.release();
            result({ success: false, data: "Address ID không tồn tại!" });
          });
          return;
        }
        connection.query("INSERT INTO `bill` SET ?", billData, (err, billResult) => {
          if (err) {
            connection.rollback(() => {
              connection.release();
              result({ success: false, data: err });
            });
            return;
          }
          const billId = billResult.insertId;
          let query = "";
          detailsData.forEach((item) => {
            query += `(NULL, '${billId}', '${item.id_product}', '${item.quantity}' ),`;
          });

          const detailBillQuery = "INSERT INTO `detail_bill` VALUES" + query.slice(0, -1);

          connection.query(detailBillQuery, (err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                result({ success: false, data: err });
              });
              return;
            }
            if (type === "buy-from-cart") {
              let cartQuery = "(";
              detailsData.forEach((item) => {
                cartQuery += `${item.id},`;
              });
              cartQuery = cartQuery.slice(0, -1) + ")";

              connection.query("DELETE FROM cart WHERE id IN " + cartQuery, (err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    result({ success: false, data: err });
                  });
                  return;
                }
                connection.commit((err) => {
                  if (err) {
                    connection.rollback(() => {
                      connection.release();
                      result({ success: false, data: err });
                    });
                    return;
                  }

                  connection.release();
                  result({
                    success: true,
                    data: {
                      message: "Đặt hàng thành công!",
                      billId: billId,
                      details: detailsData
                    }
                  });
                });
              });
            } else {
              connection.commit((err) => {
                if (err) {
                  connection.rollback(() => {
                    connection.release();
                    result({ success: false, data: err });
                  });
                  return;
                }

                connection.release();
                result({
                  success: true,
                  data: {
                    message: "Đặt hàng thành công!",
                    billId: billId,
                    details: detailsData
                  }
                });
              });
            }
          });
        });
      });
    });
  });
};

DetailBill.getByIdAccount = function (id, status, result) {
  const statusCondition = status !== undefined && status !== null ? status : "all";
  console.log(statusCondition);

  let query = `     
    SELECT        
      bill.id as id_bill,        
      bill.id_account,        
      bill.createAt,        
      bill.paymentAt,       
      bill.total_amount_order,       
      bill.confirmAt,        
      bill.cancellationAt,        
      bill.status,        
      detail_bill.id_product,        
      detail_bill.quantity,        
      products.id as product_id,        
      products.name as product_name,        
      products.thumbnail,        
      products.price,        
      products.discount,        
      products.other_discount,        
      products.slug     
    FROM bill     
    LEFT JOIN detail_bill ON detail_bill.id_bill = bill.id     
    LEFT JOIN products ON detail_bill.id_product = products.id     
    WHERE bill.id_account = ?`;

  const queryParams = [id];

  if (statusCondition !== "all") {
    query += ` AND bill.status = ?`;
    queryParams.push(statusCondition);
  }
  if (statusCondition === "all") {
    query += ` ORDER BY CAST(bill.status AS UNSIGNED) ASC, bill.createAt DESC`;
    console.log("hihi");
  } else {
    query += ` ORDER BY bill.createAt DESC`;
  }
  mysql.query(query, queryParams, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      const bills = {};
      data.forEach((row) => {
        const {
          id_bill,
          createAt,
          paymentAt,
          confirmAt,
          cancellationAt,
          status,
          id_product,
          quantity,
          product_id,
          product_name,
          thumbnail,
          price,
          discount,
          other_discount,
          slug,
          total_amount_order
        } = row;
        const formatDate = (date) => (date ? dayjs(date).format("YYYY-MM-DD").toString() : null);

        if (!bills[id_bill]) {
          bills[id_bill] = {
            id: id_bill,
            createAt: formatDate(createAt),
            paymentAt: formatDate(paymentAt),
            confirmAt: formatDate(confirmAt),
            cancellationAt: formatDate(cancellationAt),
            status,
            total_amount_order,
            products: []
          };
        }
        if (id_product) {
          bills[id_bill].products.push({
            id: product_id,
            name: product_name,
            thumbnail,
            price,
            discount,
            other_discount,
            quantity,
            slug
          });
        }
      });

      result({ status: true, data: Object.values(bills) });
    }
  });
};

DetailBill.getByIdBill = function (id, result) {
  mysql.query(
    `
    SELECT 
      products.name AS product_name, 
      products.thumbnail,
      detail_bill.id_product, 
      products.price, 
      detail_bill.quantity, 
      products.discount, 
      products.other_discount,
      address.full_name,
      address.phone,
      address.id_account,
      address.detail_address,
      address.province,
      address.district,
      address.wards
    FROM 
      detail_bill
    INNER JOIN 
      products ON detail_bill.id_product = products.id
    INNER JOIN 
      bill ON detail_bill.id_bill = bill.id
    INNER JOIN 
      address ON bill.id_address = address.id
    WHERE 
      detail_bill.id_bill = ?
    `,
    id,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        if (data.length > 0) {
          const address = {
            full_name: data[0].full_name,
            phone: data[0].phone,
            id_account: data[0].id_account,
            detail_address: data[0].detail_address,
            province: data[0].province,
            district: data[0].district,
            wards: data[0].wards
          };
          const products = data.map((item) => ({
            id_product: item.id_product,
            product_name: item.product_name,
            thumbnail: item.thumbnail,
            price: item.price,
            quantity: item.quantity,
            discount: item.discount,
            other_discount: item.other_discount
          }));

          result({ status: true, data: { address, products } });
        } else {
          result({ status: true, data: { address: null, products: [] } });
        }
      }
    }
  );
};

module.exports = DetailBill;
