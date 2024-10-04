const mysql = require("../../config/mysql_db");
const bcrypt = require("bcrypt");
const _JWT = require("../../until/_JWT");
const res = require("express/lib/response");
const dayjs = require("dayjs");

const Account = function (account) {
  this.id = account.id;
  this.account_name = account.account_name;
  this.email = account.email;
  this.phone = account.phone;
  this.full_name = account.full_name;
  this.avatar = account.avatar;
  this.sex = account.sex;
  this.birthday = account.birthday;
  this.password = account.password;
  this.permission = account.permission;
  this.status = account.status;
  this.startAt = account.startAt;
};

Account.getAll = function (query, permission, page, itemInPage, result) {
  let queryPermission = ""
  if (permission === 'all') {
    queryPermission = "(permission = '0' OR permission = '2')"
  }
  if (permission == '0')
    queryPermission = "permission = '0'"
  if (permission == '2')
    queryPermission = "permission = '2'"

  let querySearch = ""
  if (query !== '') {
    querySearch = `AND (id LIKE '%${query}%' OR account_name LIKE '%${query}%' OR full_name LIKE '%${query}%' OR phone LIKE '%${query}%')`
  }
  const querySelect = (totalPage, totalItem) => {

    mysql.query(`SELECT id, account_name, email, phone, full_name, avatar, sex, birthday, permission, status, type, createAt FROM account WHERE ${queryPermission} ${querySearch} ORDER BY createAt DESC LIMIT ${itemInPage * page - itemInPage},${itemInPage}`, function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.map((item, index) => {
          if (item.createAt) {
            let crtA = dayjs(item.createAt);
            item.createAt = crtA.format("YYYY-MM-DD").toString();
          }
          if (item.birthday) {
            let bd = dayjs(item.birthday);
            item.birthday = bd.format("YYYY-MM-DD").toString();
          }
          item.key = index
        });
        result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem });
      }

    });
  }

  mysql.query(`SELECT id, account_name, email, phone, full_name, avatar, sex, birthday, permission, status, type, createAt FROM account WHERE ${queryPermission} ${querySearch} ORDER BY createAt DESC`, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      let totalPage = data.length / itemInPage
      let surplus = data.length % itemInPage
      if (surplus > 0) {
        totalPage += 1
      }
      const totalItem = data.length
      querySelect(Math.floor(totalPage), totalItem)
    }

  });
};

Account.getAllCustomer = function (query, sex, page, itemInPage, result) {
  let querySex = ""
  if (sex === 'all') {
    querySex = ""
  }
  if (sex == '0')
    querySex = "sex = '0' AND"
  if (sex == '1')
    querySex = "sex = '1' AND"

  let querySearch = ""
  if (query !== '') {
    querySearch = ` (id LIKE '%${query}%' OR account_name LIKE '%${query}%' OR full_name LIKE '%${query}%' OR phone LIKE '%${query}%') AND`
  }
  const querySelect = (totalPage, totalItem) => {

    mysql.query(`SELECT id, account_name, email, phone, full_name, avatar, sex, birthday, permission, status, type, createAt FROM account WHERE ${querySex} ${querySearch} permission = '1' ORDER BY createAt DESC LIMIT ${itemInPage * page - itemInPage},${itemInPage}`, function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.map((item, index) => {
          if (item.createAt) {
            let crtA = dayjs(item.createAt);
            item.createAt = crtA.format("YYYY-MM-DD").toString();
          }
          if (item.birthday) {
            let bd = dayjs(item.birthday);
            item.birthday = bd.format("YYYY-MM-DD").toString();
          }
          item.key = index
        });
        result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem });
      }

    });
  }

  mysql.query(`SELECT id, account_name, email, phone, full_name, avatar, sex, birthday, permission, status, type, createAt FROM account WHERE ${querySex} ${querySearch} permission = '1' ORDER BY createAt DESC`, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      let totalPage = data.length / itemInPage
      let surplus = data.length % itemInPage
      if (surplus > 0) {
        totalPage += 1
      }
      const totalItem = data.length
      querySelect(Math.floor(totalPage), totalItem)
    }

  });
};

Account.getInfo = async function (id, result) {
  mysql.query(
    "SELECT id,account_name, email, phone, full_name, avatar, sex, birthday, permission FROM `account` where id=?",
    id,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.map((item) => {
          if (item.birthday) {
            let crtA = dayjs(item.birthday);
            item.birthday = crtA.format("YYYY-MM-DD").toString();
          }
        });
        result({ status: false, data: data });
      }


    }

  );
};

Account.register = function (formData, result) {
  const create = async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(formData.password, salt);
      formData.password = hashed;
      //create new user
      mysql.query(
        "INSERT INTO `account` SET id=REPLACE(UUID(), '-', ''), ? ",
        formData,
        function (err, data) {
          if (err) {
            result({ status: false, data: err });
          } else {
            result({ status: true, data: data });
          }

        }
      );
    } catch (error) {
      result({ status: false, data: error });
    }
  };
  mysql.query(
    "SELECT * FROM `account` where account_name = ? AND type='0'",
    [formData.account_name],
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      } else {
        if (data.length > 0) {
          result({ status: false, data: "Tài khoản đã tồn tại!" });
        } else {
          mysql.query(
            "SELECT * FROM `account` where phone = ? AND type='0'",
            [formData.phone],
            function (err, data) {
              if (err) {
                result({ status: false, data: err })
              }
              else {
                if (data.length > 0) {
                  result({ status: false, data: "Số điện thoại đã được sử dụng!" });
                } else {
                  mysql.query(
                    "SELECT * FROM `account` where email = ? AND type='0'",
                    [formData.email],
                    function (err, data) {
                      if (err) {
                        result({ status: false, data: err })
                      }
                      else {
                        if (data.length > 0) {
                          result({ status: false, data: "Email đã được sử dụng!" });
                        } else {
                          create();
                        }
                      }

                    }
                  );
                }
              }


            }
          );
        }
      }


    }
  );
};

Account.update = async function (id, formData, result) {
  mysql.query(
    "UPDATE `account` SET ? where id=?",
    [formData, id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        result({
          status: true, data: formData.avatar
        });
      }


    }
  );
};

Account.updateById = async function (id, formData, result) {
  const update = () => {
    mysql.query(
      "UPDATE `account` SET ? where id=?",
      [formData, id],
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          result({
            status: true, data: formData
          });
        }


      }
    );
  }
  mysql.query(
    "SELECT * FROM `account` where account_name = ? and id != ?",
    [formData.account_name, id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      } else {
        if (data.length > 0) {
          result({ status: false, data: "Tài khoản đã tồn tại!" });
        } else {
          mysql.query(
            "SELECT * FROM `account` where phone = ? and id != ?",
            [formData.phone, id],
            function (err, data) {
              if (err) {
                result({ status: false, data: err })
              }
              else {
                if (data.length > 0) {
                  result({ status: false, data: "Số điện thoại đã được sử dụng!" });
                } else {
                  mysql.query(
                    "SELECT * FROM `account` where email = ? and id != ?",
                    [formData.email, id],
                    function (err, data) {
                      if (err) {
                        result({ status: false, data: err })
                      }
                      else {
                        if (data.length > 0) {
                          result({ status: false, data: "Email đã được sử dụng!" });
                        } else {
                          update();
                        }
                      }

                    }
                  );
                }
              }


            }
          );
        }
      }


    }
  );
};

Account.updateOne = async function (id, formData, result) {
  const update = () => {
    mysql.query(
      "UPDATE `account` SET ? where id=?",
      [formData, id],
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          result({
            status: true, data: data
          });
        }

      }
    );
  };
  mysql.query(
    "SELECT * FROM `account` where ? ",
    [formData, id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      }
      else {
        if (data.length > 0) {
          if (typeof formData.account_name != "undefined") {
            result({ status: false, data: "Tài khoản đã tồn tại!" });
            return;
          } else if (typeof formData.phone != "undefined") {
            result({
              status: false, data: "Số điện thoại đang được sử dụng!"
            });
            return;
          } else if (typeof formData.email != "undefined") {
            result({ status: false, data: "Email đang được sử dụng!" });
            return;
          }
        } else {
          update();
        }
      }


    }
  );
};

Account.login = function (formData, result) {
  const newData = async (data) => {
    const validPassword = await bcrypt.compare(
      formData.password,
      data[0].password
    );
    if (!validPassword) {
      result({
        status: false,
        data: "Mật khẩu không chính xác!",
      });
    } else {
      const user = {
        id: data[0].id,
        account_name: data[0].account_name,
        permission: data[0].permission,
        status: data[0].status,
        avatar: data[0].avatar,
        type: data[0].type,
      };
      const info = {
        id: data[0].id,
        permission: data[0].permission,
        status: data[0].status,
        type: data[0].type,
      };
      const token = await _JWT.make(info);
      const refresh = await _JWT.refresh(info);
      result({
        status: true,
        data: { user, token, refresh },
      });
    }
  };

  mysql.query(
    "SELECT * FROM `account` WHERE (email = ? OR account_name=? OR phone=?) AND type='0'  LIMIT 1",
    [formData.value, formData.value, formData.value],
    function (err, data) {
      if (err) {
        result({
          status: false,
          data: err,
        });
      } else {
        if (data.length > 0) {
          newData(data);
        } else {
          result({
            status: false,
            data: `Không tồn tại tài khoản ${formData.value}`,
          });
        }
      }

    }
  );
};

Account.refresh = async function (refresh, result) {
  if (refresh) {
    try {
      const newData = await _JWT.verifyRefresh(refresh);

      if (newData) {
        const newToken = await _JWT.make(newData.data);
        result({
          status: true,
          data: newToken,
        });
      }
    } catch (error) {
      result({
        status: false,
        data: "Token is invalid!",
      });
    }
  } else {
    result({
      status: false,
      data: "Token is not exist!",
    });
  }
};

Account.changeAvatar = function (id, formData, result) {
  mysql.query(
    "UPDATE `account` SET ? WHERE id =?",
    [formData, id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        result({ status: true, data: data });
      }


    }
  );
};

Account.remove = function (id, result) {
  mysql.query("DELETE FROM account WHERE id = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: "Tài khoản đã bị xóa!" });
    }

  });
};

Account.changePass = function (id, formData, result) {
  const newData = async (data) => {
    const validPassword = await bcrypt.compare(
      formData.password,
      data[0].password
    );
    if (!validPassword) {
      result({ status: false, data: 'Mật khẩu cũ không chính xác!' });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(formData.newpass, salt);
      formData.newpass = hashed;
      mysql.query(
        "UPDATE `account` SET password=?, updateAt=? WHERE id=?",
        [formData.newpass, formData.updateAt, id],
        function (err, data) {
          if (err) {
            result({ status: false, data: err });
          } else {
            result({ status: true });
          }


        }
      );
    }
  };

  mysql.query(
    "SELECT * FROM `account` WHERE id = ? LIMIT 1",
    [id],
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      }
      else {
        if (data.length > 0) {
          newData(data);
        } else {
          result({ status: false });
        }
      }


    }
  );
};

Account.firebaseLogin = function (formData, result) {
  const newData = async (data, value) => {
    if (value === 0) {
      const user = {
        id: data[0].id,
        account_name: data[0].account_name,
        permission: data[0].permission,
        status: data[0].status,
        avatar: data[0].avatar,
        type: data[0].type,
      };
      const info = {
        id: data[0].id,
        permission: data[0].permission,
        status: data[0].status,
        type: data[0].type,
      };
      const token = await _JWT.make(info);
      const refresh = await _JWT.refresh(info);
      const resultData = {
        status: true,
        data: { user, token, refresh },
      };
      result(resultData);
    }
    if (value === 1) {
      const user = {
        id: formData.id,
        account_name: formData.account_name,
        permission: formData.permission,
        status: formData.status,
        avatar: formData.avatar,
        type: formData.type,
      };
      const info = {
        id: formData.id,
        permission: formData.permission,
        status: formData.status,
        type: formData.type,
      };
      const token = await _JWT.make(info);
      const refresh = await _JWT.refresh(info);
      const resultData = {
        status: true,
        data: { user, token, refresh },
      };
      result(resultData);
    }
  };
  const registerByFirebase = () => {
    mysql.query("INSERT INTO `account` SET ? ", formData, function (err, data) {
      if (data) {
        newData(formData, 1);
      } else {
        const resultData = {
          data: err,
          status: false,
        };
        result(resultData);
      }


    });
  };
  mysql.query(
    "SELECT * FROM `account` WHERE `id`= ? AND (type='1' OR type='2') LIMIT 1",
    formData.id,
    function (err, data) {
      if (data) {
        if (data.length > 0) {
          newData(data, 0);
        } else {
          registerByFirebase();
        }
      }


    }

  );
};

Account.VerifyEmail = function (formData, result) {
  mysql.query(
    "SELECT * FROM `account` WHERE email = ? LIMIT 1",
    formData.email,
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      }
      else {
        if (data.length > 0) {
          result({ status: true });
        } else {
          result({ status: false, data: 'Email chưa được đăng ký tài khoản!' });
        }
      }


    }
  );
};

Account.resetPassword = function (formData, result) {
  const reset = async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(formData.password, salt);

      mysql.query(
        `UPDATE account SET password = '${hashed}' where email = ?`,
        formData.email,
        function (err, data) {
          if (err) {
            result({ status: false, data: err });
          } else {
            result({ status: true, data: 'Đổi mật khẩu thành công!' });
          }

        }
      );
    } catch (error) {
      result({ status: false, data: error });
    }
  };
  reset()
};

Account.checkRequiredAccount = function (formData, result) {
  mysql.query(
    "SELECT * FROM `account` where account_name = ? AND type='0'  ",
    [formData.account_name],
    function (err, data) {
      if (err) {
        result({ status: false, data: err })
      } else {
        if (data.length > 0) {
          result({ status: false, data: "Tài khoản đã tồn tại!" });
        } else {
          mysql.query(
            "SELECT * FROM `account` where phone = ? ",
            [formData.phone],
            function (err, data) {
              if (err) {
                result({ status: false, data: err })
              }
              else {
                if (data.length > 0) {
                  result({ status: false, data: "Số điện thoại đã được sử dụng!" });
                } else {
                  mysql.query(
                    "SELECT * FROM `account` where email = ? ",
                    [formData.email],
                    function (err, data) {
                      if (err) {
                        result({ status: false, data: err })
                      }
                      else {
                        if (data.length > 0) {
                          result({ status: false, data: "Email đã được sử dụng!" });
                        } else {
                          result({ status: true });
                        }
                      }

                    }
                  );
                }
              }


            }
          );
        }
      }


    }
  );
}

module.exports = Account;
