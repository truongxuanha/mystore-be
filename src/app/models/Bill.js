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
  let querySearch = "";
  if (query !== "") {
    querySearch = `AND (bill.id LIKE '%${query}%' OR account.account_name LIKE '%${query}%')`;
  }
  let queryStatus = "";
  if (status !== "") {
    queryStatus = `AND bill.status = '${status}'`;
  }
  if (status === "all") {
    queryStatus = "";
  }
  const querySelect = (totalPage, totalItem) => {
    mysql.query(
      `SELECT bill.id,bill.id_account, account.account_name, account.email,account.phone,bill.createAt, bill.confirmAt, bill.paymentAt, bill.cancellationAt, bill.note_cancelation ,bill.discount,bill.status FROM bill, account WHERE bill.id_account = account.id ${querySearch} ${queryStatus} ORDER BY createAt DESC LIMIT ${
        itemInPage * page - itemInPage
      },${itemInPage}`,
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          data.map((item, index) => {
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
            item.key = index;
          });
          result({
            status: true,
            data: data,
            totalPage: totalPage,
            totalItem: totalItem
          });
        }
      }
    );
  };

  mysql.query(
    `SELECT bill.id,bill.id_account, account.account_name, account.email,account.phone,bill.createAt, bill.confirmAt, bill.paymentAt, bill.cancellationAt, bill.note_cancelation,bill.discount,bill.status FROM bill, account WHERE bill.id_account = account.id ${querySearch} ${queryStatus} ORDER BY createAt DESC`,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        let totalPage = data.length / itemInPage;
        let surplus = data.length % itemInPage;
        if (surplus > 0) {
          totalPage += 1;
        }
        const totalItem = data.length;
        querySelect(Math.floor(totalPage), totalItem);
      }
    }
  );
};

Bill.create = function (formData, result) {
  mysql.query("INSERT INTO `bill` SET ?", formData, function (err, data) {
    if (err) {
      result({ Success: false, data: err });
    } else {
      result({ Success: true, data: { id: data.insertId, ...formData } });
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
