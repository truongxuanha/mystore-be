const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");
const Cart = require("./Cart");

const Bill = function (Bill) {
  this.id = Bill.id;
  this.id_account = Bill.id_account;
  this.id_address = Bill.id_address;
  this.discount = Bill.discount;
  this.createAt = Bill.createAt;
  this.status = Bill.status;
  this.paymentAt = Bill.paymentAt;
  this.cancellationAt = Bill.cancellationAt;
};

Bill.getByAccount = function (id, result) {
  mysql.query("SELECT * FROM `bill` WHERE id_account=? ORDER BY createAt DESC", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      data.map((item) => {
        if (item.createAt) {
          let crtA = dayjs(item.createAt);
          item.createAt = crtA.format("YYYY-MM-DD").toString();
        }
        if (item.paymentAt) {
          let pmA = dayjs(item.paymentAt);
          item.paymentAt = pmA.format("YYYY-MM-DD").toString();
        }
        if (item.confirmAt) {
          let spA = dayjs(item.confirmAt);
          item.confirmAt = spA.format("YYYY-MM-DD").toString();
        }
        if (item.cancellationAt) {
          let clA = dayjs(item.cancellationAt);
          item.cancellationAt = clA.format("YYYY-MM-DD").toString();
        }
      });
      result({ status: true, data: data });
    }
  });
};

Bill.getByStatus = function (status, id, result) {
  mysql.query("SELECT * FROM bill WHERE `status` =? AND `id_account`=?  ORDER BY createAt DESC", [status, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      data.map((item) => {
        if (item.createAt) {
          let crtA = dayjs(item.createAt);
          item.createAt = crtA.format("YYYY-MM-DD").toString();
        }
        if (item.paymentAt) {
          let pmA = dayjs(item.paymentAt);
          item.paymentAt = pmA.format("YYYY-MM-DD").toString();
        }
        if (item.confirmAt) {
          let spA = dayjs(item.confirmAt);
          item.confirmAt = spA.format("YYYY-MM-DD").toString();
        }
        if (item.cancellationAt) {
          let clA = dayjs(item.cancellationAt);
          item.cancellationAt = clA.format("YYYY-MM-DD").toString();
        }
      });
      result({ status: true, data: data });
    }
  });
};

Bill.getAllByAdmin = function (query, status, page, itemInPage, result) {
  const offset = (page - 1) * itemInPage;

  let querySearch = "";
  if (query && query.trim() !== "") {
    querySearch = `AND (bill.id LIKE '%${query}%' OR account.account_name LIKE '%${query}%')`;
  }

  let queryStatus = "";
  if (status && status !== "all") {
    queryStatus = `AND bill.status = '${status}'`;
  }
  const countQuery = `
    SELECT COUNT(*) AS totalItem
    FROM bill
    INNER JOIN account ON bill.id_account = account.id
    WHERE 1=1 ${querySearch} ${queryStatus}
  `;
  const dataQuery = `
    SELECT 
      bill.id,
      bill.id_account,
      bill.total_amount_order,
      account.account_name,
      account.email AS email_user,
      account.phone,
      bill.createAt,
      bill.confirmAt,
      bill.paymentAt,
      bill.cancellationAt,
      bill.note_cancelation,
      bill.wait_delivery,
      bill.discount,
      bill.status
    FROM bill
    INNER JOIN account ON bill.id_account = account.id
    WHERE 1=1 ${querySearch} ${queryStatus}
    ORDER BY bill.createAt DESC
    LIMIT ${offset}, ${itemInPage}
  `;
  mysql.query(countQuery, function (err, countResult) {
    if (err) {
      result({ status: false, data: err });
      return;
    }

    const totalItem = countResult[0]?.totalItem || 0;
    const totalPage = Math.ceil(totalItem / itemInPage);

    mysql.query(dataQuery, function (err, data) {
      if (err) {
        result({ status: false, data: err });
        return;
      }
      const formattedData = data.map((item, index) => ({
        ...item,
        createAt: item.createAt ? dayjs(item.createAt).format("YYYY-MM-DD") : null,
        confirmAt: item.confirmAt ? dayjs(item.confirmAt).format("YYYY-MM-DD") : null,
        paymentAt: item.paymentAt ? dayjs(item.paymentAt).format("YYYY-MM-DD") : null,
        cancellationAt: item.cancellationAt ? dayjs(item.cancellationAt).format("YYYY-MM-DD") : null,
        wait_delivery: item.wait_delivery ? dayjs(item.wait_delivery).format("YYYY-MM-DD") : null,
        key: index
      }));

      result({
        status: true,
        data: formattedData,
        totalPage,
        totalItem
      });
    });
  });
};

Bill.create = function (formData, result) {
  if (!formData.total_amount_order) {
    result({ success: false, data: "Missing required field: total_amount_order" });
    return;
  }
  mysql.query("INSERT INTO `bill` SET ?", formData, function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      result({ success: true, data: { id: data.insertId, ...formData } });
    }
  });
};

Bill.update = function (id, formData, result) {
  mysql.query("UPDATE `bill` SET ? where id=?", [formData, id], function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      result({ success: true, data: formData });
    }
  });
};

Bill.remove = function (id, result) {
  const deleteBill = () => {
    mysql.query("DELETE FROM `bill` where id=?", id, function (err, data) {
      if (err) {
        result({ success: false, data: err });
      } else {
        result({ success: true });
      }
    });
  };
  mysql.query("DELETE FROM `detail_bill` where id_bill= ? ", id, function (err, data) {
    if (err) {
      result({ success: false, data: err });
    } else {
      deleteBill();
    }
  });
};

module.exports = Bill;
