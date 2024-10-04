const mysql = require('../../config/mysql_db')
const dayjs = require("dayjs");

const Manufacturer = function (manufacturer) {
  this.id = manufacturer.id
  this.name = manufacturer.name
  this.img = manufacturer.img
  this.slug = manufacturer.slug
}

Manufacturer.getAll = function (result) {

  mysql.query(`SELECT * FROM manufacturer`, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: data })
    }
  })
}

Manufacturer.getAllByAdmin = function (query, page, itemInPage, result) {
  let querySearch = ""
  if (query !== '') {
    querySearch = `WHERE id LIKE '%${query}%' OR name LIKE '%${query}%'`
  }
  const querySelect = (totalPage, totalItem) => {

    mysql.query(`SELECT * FROM manufacturer ${querySearch} ORDER BY createAt DESC LIMIT ${itemInPage * page - itemInPage},${itemInPage}`, function (err, data) {
      if (err) {
        result({ status: false, data: err })
      }
      else {
        data.map((item, index) => {
          if (item.createAt) {
            let crtA = dayjs(item.createAt);
            item.createAt = crtA.format("YYYY-MM-DD").toString();
          }
          if (item.updateAt) {
            let udA = dayjs(item.updateAt);
            item.updateAt = udA.format("YYYY-MM-DD").toString();
          }
          item.key = index
        });
        result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem })
      }
    })
  }

  mysql.query(`SELECT * FROM manufacturer ${querySearch} ORDER BY createAt DESC`, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      let totalPage = data.length / itemInPage
      let surplus = data.length % itemInPage
      if (surplus > 0) {
        totalPage += 1
      }
      const totalItem = data.length
      querySelect(Math.floor(totalPage), totalItem)
    }
  })
}

Manufacturer.getById = function (id, result) {
  mysql.query("SELECT * FROM `manufacturer` where id=?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: data })
    }


  })
}

Manufacturer.getBySlug = function (slug, result) {
  mysql.query("SELECT * FROM `manufacturer` where slug=? LIMIT 1", slug, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: data })
    }

  })
}


Manufacturer.create = function (formData, result) {
  mysql.query("INSERT INTO `manufacturer` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: { id: data.insertId, ...formData } })
    }


  })
}
Manufacturer.update = function (id, formData, result) {
  mysql.query(`UPDATE manufacturer SET ? WHERE id= '${id}'`, formData, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: { id: id, ...formData } })
    }


  })
}
Manufacturer.remove = function (id, result) {
  mysql.query("DELETE FROM `manufacturer` WHERE `id` = ?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err })
    }
    else {
      result({ status: true, data: `Xóa dữ liệu thành công !` })
    }


  })
}

module.exports = Manufacturer