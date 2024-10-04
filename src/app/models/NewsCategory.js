const mysql = require('../../config/mysql_db')
const dayjs = require('dayjs');

const NewsCategory = function () {

}

NewsCategory.getAllByAdmin = function (page, itemInPage, result) {
    const querySelect = (totalPage, totalItem) => {
        mysql.query(`SELECT * FROM news_category ORDER BY createdAt DESC LIMIT ${itemInPage * page - itemInPage},${itemInPage}`, function (err, data) {
            if (err) {
                result({ status: false, data: err })
            }
            else {
                data.map((item, index) => {
                    if (item.createdAt) {
                        let crtA = dayjs(item.createdAt);
                        item.createdAt = crtA.format("YYYY-MM-DD").toString();
                    }
                    if (item.updatedAt) {
                        let udA = dayjs(item.updatedAt);
                        item.updatedAt = udA.format("YYYY-MM-DD").toString();
                    }
                    item.key = index
                });
                result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem })
            }
        })
    }

    mysql.query("SELECT * FROM news_category ORDER BY createdAt DESC", function (err, data) {
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

NewsCategory.getAll = function (result) {
    mysql.query("SELECT * FROM `news_category`", function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: data })
        }
    })
}

NewsCategory.create = function (formData, result) {
    mysql.query("INSERT INTO news_category SET ?", formData, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: { id: data.insertId, ...formData } })
        }


    })
}

NewsCategory.update = function (id, formData, result) {
    mysql.query("UPDATE `news_category` SET ? WHERE id =?", [formData, id], function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: { formData } })
        }
    })
}

NewsCategory.remove = function (id, result) {
    mysql.query("DELETE FROM `news_category` WHERE id =?", id, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: data })
        }
    })
}

module.exports = NewsCategory