const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");

const Products = function(product) {
    this.id = product.id;
    this.id_manu = product.id_manu;
    this.name = product.name;
    this.price = product.price;
    this.discount = product.discount;
    this.quantity = product.quantity;
    this.thumbnail = product.thumbnail;
    this.slug = product.slug;
    this.other_discount = product.other_discount;
    this.description = product.description;
};

Products.getAll = function(result) {
    mysql.query("SELECT * FROM `products`", function(err, data) {
        if (err) {
            result({ status: false, data: err });
        } else {
            result({ status: true, data: data });
        }
    });
};

Products.getAllByAdmin = function(
    query,
    sort,
    idManu,
    page,
    itemInPage,
    result
) {
    let querySearch = "";
    if (query !== "") {
        if (idManu === "all") {
            querySearch = `WHERE (product_id LIKE '%${query}%' OR product_name LIKE '%${query}%')`;
        } else {
            querySearch = `WHERE (product_id LIKE '%${query}%' OR product_name LIKE '%${query}%') AND id = '${idManu}'`;
        }
    } else {
        if (idManu === "all") {
            querySearch = "";
        } else {
            querySearch = `WHERE id = '${idManu}'`;
        }
    }

    const querySelect = (totalPage, totalItem) => {
        mysql.query(
            `SELECT * FROM manufacturer RIGHT JOIN (SELECT products.id as product_id, products.name as product_name, products.id_manu, products.thumbnail, products.price, products.discount, products.quantity, products.slug as product_slug, products.other_discount, products.description, products.createAt as product_createAt, IFNULL(products.quantity - IFNULL(b.dtb_quantity,0), 0) as remaining_quantity FROM products LEFT JOIN (SELECT detail_bill.id_product as dtb_id_product, SUM(detail_bill.quantity) as dtb_quantity FROM detail_bill, bill WHERE detail_bill.id_bill = bill.id AND bill.status < 3 GROUP BY detail_bill.id_product) as b ON products.id = b.dtb_id_product) as d ON manufacturer.id = d.id_manu  ${querySearch} ORDER BY price ${sort} LIMIT ${
        itemInPage * page - itemInPage
      },${itemInPage}`,
            function(err, data) {
                if (err) {
                    result({ status: false, data: err });
                } else {
                    data.map((item, index) => {
                        if (item.product_createAt) {
                            let crtA = dayjs(item.product_createAt);
                            item.product_createAt = crtA.format("YYYY-MM-DD").toString();
                        }
                        item.key = index;
                    });
                    result({
                        status: true,
                        data: data,
                        totalPage: totalPage,
                        totalItem: totalItem,
                    });
                }
            }
        );
    };

    mysql.query(
        `SELECT * FROM manufacturer RIGHT JOIN (SELECT products.id as product_id, products.name as product_name, products.id_manu, products.thumbnail, products.price, products.discount, products.quantity, products.slug as product_slug, products.other_discount, products.description, products.createAt as product_createAt, IFNULL(products.quantity - IFNULL(b.dtb_quantity,0), 0) as remaining_quantity FROM products LEFT JOIN (SELECT detail_bill.id_product as dtb_id_product, SUM(detail_bill.quantity) as dtb_quantity FROM detail_bill, bill WHERE detail_bill.id_bill = bill.id AND bill.status < 3 GROUP BY detail_bill.id_product) as b ON products.id = b.dtb_id_product) as d ON manufacturer.id = d.id_manu  ${querySearch} ORDER BY price ${sort}`,
        function(err, data) {
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

Products.getBySlug = function(slug, result) {
    mysql.query(
        "SELECT * FROM manufacturer RIGHT JOIN (SELECT products.id as product_id, products.name as product_name, products.id_manu, products.thumbnail, products.price, products.discount, products.quantity, products.slug as product_slug, products.other_discount, products.description, IFNULL(products.quantity - IFNULL(b.dtb_quantity,0), 0) as remaining_quantity FROM products LEFT JOIN (SELECT detail_bill.id_product as dtb_id_product, SUM(detail_bill.quantity) as dtb_quantity FROM detail_bill, bill WHERE detail_bill.id_bill = bill.id AND bill.status < 3 GROUP BY detail_bill.id_product) as b ON products.id = b.dtb_id_product WHERE products.slug = ? LIMIT 1) as d ON manufacturer.id = d.id_manu",
        slug,
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                result({ status: true, data: data });
            }
        }
    );
};

Products.getBySlugManu = function(
    slug,
    min,
    max,
    sort,
    page,
    itemInPage,
    result
) {
    mysql.query(
        `SELECT products.id, products.id_manu, products.name,manufacturer.name as mn_name, products.thumbnail, products.price,products.discount, ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) as final_price, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk, manufacturer.name as mn_name FROM products LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product LEFT JOIN manufacturer ON products.id_manu = manufacturer.id WHERE manufacturer.slug = ?  AND ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) BETWEEN ${min} AND ${max} ORDER BY final_price ${sort}`,
        slug,
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });
                let totalPage = newData.length / itemInPage;
                let surplus = newData.length % itemInPage;
                if (surplus > 0) {
                    totalPage += 1;
                }
                let dataResponse = [];
                newData.map((item, index) => {
                    if (
                        index >= page * itemInPage - itemInPage &&
                        index < page * itemInPage
                    ) {
                        dataResponse.push(item);
                    }
                });
                result({
                    status: true,
                    data: dataResponse,
                    totalPage: Math.floor(totalPage),
                });
            }
        }
    );
};

Products.getById = function(id, result) {
    mysql.query("SELECT * FROM `products` where id=?", id, function(err, data) {
        if (err) {
            result({ status: false, data: err });
        } else {
            result({ status: true, data: data });
        }
    });
};
// ORDER BY RAND() LIMIT 20
Products.getRandom = function(result) {
    mysql.query(
        "SELECT products.id, products.id_manu, products.name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY RAND() LIMIT 20",
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });

                result({ status: true, data: newData });
            }
        }
    );
};

Products.search = function(query, min, max, sort, page, itemInPage, result) {
    mysql.query(
        `SELECT products.id, products.id_manu, products.name, products.thumbnail, products.price,products.discount, ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) as final_price, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk, manufacturer.name as mn_name FROM products LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product LEFT JOIN manufacturer ON products.id_manu = manufacturer.id WHERE products.name LIKE '%${query}%' AND ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) BETWEEN ${min} AND ${max} ORDER BY final_price ${sort} `,
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });

                let totalPage = newData.length / itemInPage;
                let surplus = newData.length % itemInPage;
                if (surplus > 0) {
                    totalPage += 1;
                }
                let dataResponse = [];
                newData.map((item, index) => {
                    if (
                        index >= page * itemInPage - itemInPage &&
                        index < page * itemInPage
                    ) {
                        dataResponse.push(item);
                    }
                });
                result({
                    status: true,
                    data: dataResponse,
                    totalPage: Math.floor(totalPage),
                });
            }
        }
    );
};
// ORDER BY other_discount DESC LIMIT 10
// SELECT * FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product ORDER BY products.other_discount DESC LIMIT 20
Products.getBigSaleProduct = function(result) {
    mysql.query(
        "SELECT products.id, products.id_manu, products.name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY products.other_discount  DESC LIMIT 20",
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });

                result({ status: true, data: newData });
            }
        }
    );
};

// ORDER BY other_discount DESC LIMIT 10
// "SELECT * FROM `products` ORDER BY createAt DESC LIMIT 10",

Products.getNewProduct = function(result) {
    mysql.query(
        "SELECT products.id, products.id_manu, products.name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY products.createAt DESC LIMIT 20",
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });

                result({ status: true, data: newData });
            }
        }
    );
};

// ORDER BY other_discount DESC LIMIT 10
Products.getHotProduct = function(result) {
    mysql.query(
        "SELECT products.id,products.id_manu, products.name, products.thumbnail,products.price,products.discount, products.quantity, products.slug as product_slug,products.other_discount ,ratting_comment.star, ratting_comment.content, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM products LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product INNER JOIN (SELECT products.id, SUM(detail_bill.quantity) AS total FROM products LEFT JOIN detail_bill ON products.id = detail_bill.id_product GROUP BY detail_bill.id_product ORDER BY total DESC LIMIT 20) AS TB2 WHERE products.id = TB2.id",
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                let newData = [];

                for (let index = 1; index < data.length; index++) {
                    if (index === 1) {
                        newData.push(data[index - 1]);
                    }
                    if (data[index].id !== data[index - 1].id) {
                        newData.push(data[index]);
                    }
                }
                newData.map((item) => {
                    let dataStar = [0, 0, 0, 0, 0];
                    let totalStar = 0;
                    data.map((it) => {
                        if (item.id == it.id && it.parent_id === null) {
                            if (it.star == 1) {
                                dataStar[0] += 1;
                            }
                            if (it.star == 2) {
                                dataStar[1] += 1;
                            }
                            if (it.star == 3) {
                                dataStar[2] += 1;
                            }
                            if (it.star == 4) {
                                dataStar[3] += 1;
                            }
                            if (it.star == 5) {
                                dataStar[4] += 1;
                            }
                            if (it.star !== null) {
                                totalStar += 1;
                            }
                        }
                    });

                    let type = 0;
                    let point = 0;
                    let a =
                        1 * dataStar[0] +
                        2 * dataStar[1] +
                        3 * dataStar[2] +
                        4 * dataStar[3] +
                        5 * dataStar[4];
                    let b = totalStar;
                    if (totalStar > 0) {
                        type = Math.round(a / b, 0);
                        point = (a / b).toFixed(1);
                    }
                    item.starType = type;
                    item.totalStar = totalStar;
                    item.point = point;
                    delete item.star;
                });

                result({ status: true, data: newData });
            }
        }
    );
};

Products.create = async function(formData, result) {
    mysql.query("INSERT INTO `products` SET ?", formData, function(err, data) {
        if (err) {
            result({ status: false, data: err });
        } else {
            result({ status: true, data: { id: data.insertId, ...formData } });
        }
    });
};

Products.update = function(id, formData, result) {
    mysql.query(
        "UPDATE `products` SET ? WHERE id=?", [formData, id],
        function(err, data) {
            if (err) {
                result({ status: false, data: err });
            } else {
                result({ status: true, data: { id: id, ...formData } });
            }
        }
    );
};

Products.remove = function(id, result) {
    mysql.query("DELETE FROM `products` WHERE `id`=?", id, function(err, data) {
        if (err) {
            result({ status: false, data: err });
        } else {
            result({ status: true, data: "Xóa dữ liệu thành công!" });
        }
    });
};

Products.updateQuantity = function(formData, result) {
    if (formData.type == "minus") {
        mysql.query(
            `UPDATE products SET quantity = quantity - ${formData.quantity} WHERE id = ${formData.id_product}`,
            function(err, data) {
                if (err) {
                    result({ Success: false, Message: err });
                } else {
                    result({ Success: true, data: formData.id_product });
                }
            }
        );
    }
    if (formData.type == "add") {
        mysql.query(
            `UPDATE products SET quantity = quantity + ${formData.quantity} WHERE id = ${formData.id_product}`,
            function(err, data) {
                if (err) {
                    result({ Success: false, Message: err });
                } else {
                    result({ Success: true, data: formData.id_product });
                }
            }
        );
    }
};

module.exports = Products;