const mysql = require('../../config/mysql_db')
const dayjs = require('dayjs');

const Comment = function () {

}

Comment.getByIdProduct = function (id, sort, page, itemInPage, result) {
    const commentQuery = (totalPage, totalComment, dataComment) => {
        mysql.query(`SELECT account.full_name, account.permission, account.avatar, comment.id, comment.id_account, comment.id_product, comment.content, comment.createAt, comment.updateAt, comment.parent_id, comment.status FROM comment LEFT JOIN account ON account.id = comment.id_account WHERE comment.parent_id IS NOT NULL AND comment.id_product = ?`, id, function (err, data) {
            if (err) {
                result({ status: false, data: err })
            }
            else {
                data.map(item => {
                    if (item.createAt) {
                        let crtA = dayjs(item.createAt);
                        item.createAt = crtA.format("DD-MM-YYYY").toString()
                    }
                    if (item.updateAt) {
                        let udA = dayjs(item.updateAt);
                        item.updateAt = udA.format("DD-MM-YYYY").toString()
                    }
                })
                result({ status: true, totalPage: totalPage, totalComment: totalComment, dataComment: dataComment, dataReply:data })
            }
        })
    }
    const selectAndSort = (totalPage, totalComment) => {
        mysql.query(`SELECT account.full_name, account.permission, account.avatar, comment.id, comment.id_account, comment.id_product, comment.content, comment.createAt, comment.updateAt, comment.parent_id, comment.status FROM comment LEFT JOIN account ON account.id = comment.id_account WHERE comment.parent_id IS NULL AND comment.id_product = ? ORDER BY IFNULL(comment.updateAt, comment.createAt) ${sort} LIMIT ${itemInPage * page - itemInPage},${itemInPage}`, id, function (err, data) {
            if (err) {
                result({ status: false, data: err })
            }
            else {
                data.map(item => {
                    if (item.createAt) {
                        let crtA = dayjs(item.createAt);
                        item.createAt = crtA.format("DD-MM-YYYY").toString()
                    }
                    if (item.updateAt) {
                        let udA = dayjs(item.updateAt);
                        item.updateAt = udA.format("DD-MM-YYYY").toString()
                    }
                })
                const dataComment = data
                commentQuery(totalPage, totalComment, dataComment)
            }
        })
    }
    mysql.query("SELECT * FROM `comment` WHERE `status` = 0 AND parent_id IS NULL and id_product = ?", id, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            let totalPage = data.length / itemInPage
            let surplus = data.length % itemInPage
            if (surplus > 0) {
                totalPage += 1
            }
            totalPage = Math.floor(totalPage)
            totalComment = data.length
            selectAndSort(totalPage, totalComment)
        }
    })
}

Comment.getById = function (id, result) {
    mysql.query("SELECT * FROM comment WHERE comment.id = ? AND status = 0 ORDER BY comment.createAt DESC ", id, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: data })
        }


    })
}

Comment.create = function (formData, result) {
    mysql.query("INSERT INTO comment SET ?", formData, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: { id: data.insertId, ...formData } })
        }


    })
}

Comment.update = function (id, formData, result) {
    mysql.query("UPDATE `comment` SET ? WHERE id =?", [formData, id], function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            result({ status: true, data: data })
        }


    })
}

Comment.remove = function (id, result) {
    mysql.query("DELETE FROM `comment` WHERE parent_id =?", id, function (err, data) {
        if (err) {
            result({ status: false, data: err })
        }
        else {
            mysql.query("DELETE FROM `comment` WHERE id =?", id, function (err, data) {
                if (err) {
                    result({ status: false, data: err })
                }
                else {
                    result({ status: true, data: data })
                }
            })
        }

    })
}

module.exports = Comment