const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");

const RattingComment = function () {};

RattingComment.getByIdProduct = function (id, page, itemInPage, sort, star, result) {
  const queryStar = star === "all" ? "" : `AND star = ${star}`;

  const querySelectAndFilter = (totalPage, dataAccount) => {
    mysql.query(
      `SELECT account.full_name, account.permission, account.avatar, rt1.id, rt1.id_account, rt1.id_product, rt1.content, rt1.star, rt1.createAt, rt1.updateAt, rt1.parent_id, rt1.status FROM ratting_comment as rt1 INNER JOIN (SELECT ratting_comment.id AS rt2_id FROM ratting_comment WHERE id_product = '${id}' AND parent_id IS NULL ${queryStar} ORDER BY IFNULL(updateAt, createAt) ${sort} LIMIT ${
        itemInPage * page - itemInPage
      },${itemInPage}) as rt2 ON rt1.id = rt2.rt2_id OR rt1.parent_id = rt2.rt2_id LEFT JOIN account ON rt1.id_account = account.id WHERE rt1.status = 0 ORDER BY IFNULL(rt1.updateAt, rt1.createAt) ${sort}`,
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          data.map((item) => {
            if (item.createAt) {
              let crtA = dayjs(item.createAt);
              item.createAt = crtA.format("DD-MM-YYYY").toString();
            }
            if (item.updateAt) {
              let udA = dayjs(item.updateAt);
              item.updateAt = udA.format("DD-MM-YYYY").toString();
            }
          });
          result({ status: true, data: data, totalPage: totalPage, dataAccount: dataAccount });
        }
      }
    );
  };

  const queryTotal = () => {
    mysql.query(
      `SELECT id_account FROM ratting_comment WHERE id_product = '${id}' AND parent_id IS NULL ${queryStar} AND status = 0 ORDER BY IFNULL(updateAt, createAt) ${sort}`,
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          let totalPage = data.length / itemInPage;
          let surplus = data.length % itemInPage;
          if (surplus > 0) {
            totalPage += 1;
          }
          totalPage = Math.floor(totalPage);
          const dataAccount = data;
          querySelectAndFilter(totalPage, dataAccount);
        }
      }
    );
  };
  queryTotal();
};

RattingComment.getAllByIdProduct = function (id, result) {
  mysql.query("SELECT * FROM `ratting_comment` WHERE `id_product` = ? and status = '0' and parent_id IS NULL", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      let one = 0;
      let two = 0;
      let three = 0;
      let four = 0;
      let five = 0;
      const newStar = [];
      let totalStar = 0;
      if (data.length > 0) {
        data.map((item) => {
          if (item.star === 5) {
            five += 1;
          }
          if (item.star === 4) {
            four += 1;
          }
          if (item.star === 3) {
            three += 1;
          }
          if (item.star === 2) {
            two += 1;
          }
          if (item.star === 1) {
            one += 1;
          }
          totalStar += 1;
        });
        newStar.push(five, four, three, two, one);

        let point = 0;
        let a = 1 * one + 2 * two + 3 * three + 4 * four + 5 * five;
        let b = totalStar;
        if (totalStar > 0) {
          point = (a / b).toFixed(1);
        }
        result({ status: true, data: newStar, point: point });
      } else {
        result({ status: true, data: [0, 0, 0, 0, 0], point: 0 });
      }
    }
  });
};

RattingComment.create = function (formData, result) {
  mysql.query("INSERT INTO ratting_comment SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: data.insertId, ...formData } });
    }
  });
};

RattingComment.getAll = function (result) {
  mysql.query("SELECT * FROM ratting_comment", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      const newData = data.filter((item) => item.parent_id === null);
      result({ status: true, data: newData });
    }
  });
};

RattingComment.getBySortDiscount = function (result) {
  mysql.query(
    "SELECT ratting_comment.id,ratting_comment.star, ratting_comment.id_product, ratting_comment.parent_id FROM ratting_comment LEFT JOIN products ON ratting_comment.id_product = products.id ORDER BY products.other_discount DESC",
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        const newData = data.filter((item) => item.parent_id === null);
        result({ status: true, data: newData });
      }
    }
  );
};

RattingComment.getByNewProduct = function (result) {
  mysql.query(
    "SELECT ratting_comment.id,ratting_comment.star, ratting_comment.id_product, ratting_comment.parent_id FROM ratting_comment LEFT JOIN products ON ratting_comment.id_product = products.id ORDER BY products.createAt DESC",
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        const newData = data.filter((item) => item.parent_id === null);
        result({ status: true, data: newData });
      }
    }
  );
};

RattingComment.getById = function (id, result) {
  mysql.query("SELECT * FROM ratting_comment WHERE id = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      data.map((item) => {
        if (item.createAt) {
          let crtA = dayjs(item.createAt);
          item.createAt = crtA.format("DD-MM-YYYY").toString();
        }
        if (item.updateAt) {
          let udA = dayjs(item.updateAt);
          item.updateAt = udA.format("DD-MM-YYYY").toString();
        }
      });
      result({ status: true, data: data });
    }
  });
};

RattingComment.update = function (formData, id, result) {
  mysql.query("UPDATE `ratting_comment` SET ? where id=?", [formData, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Success" });
    }
  });
};

RattingComment.removeReply = function (id, result) {
  mysql.query("DELETE FROM ratting_comment WHERE parent_id = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Tài khoản đã bị xóa!" });
    }
  });
};

RattingComment.removebyid = function (id, result) {
  mysql.query("DELETE FROM ratting_comment WHERE id = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Tài khoản đã bị xóa!" });
    }
  });
};

module.exports = RattingComment;
