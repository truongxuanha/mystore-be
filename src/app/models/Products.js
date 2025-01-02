const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");

const Products = function (product) {
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

Products.getAll = function (result) {
  mysql.query("SELECT *,id FROM `products`", function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data });
    }
  });
};

Products.getAllByAdmin = function (query, sort, idManu = "all", page, itemInPage, category, result) {
  let querySearch = "";
  let queryParams = [];
  if (query) {
    querySearch += `(products.id LIKE ? OR products.name LIKE ?)`;
    queryParams.push(`%${query}%`, `%${query}%`);
  }

  if (idManu !== "all") {
    if (querySearch) querySearch += " AND ";
    querySearch += `products.id_manu = ?`;
    queryParams.push(idManu);
  }

  if (category) {
    if (querySearch) querySearch += " AND ";
    querySearch += `products.category_id = ?`;
    queryParams.push(category);
  }

  querySearch = querySearch ? `WHERE ${querySearch}` : "";

  const querySelect = (totalPage, totalItem) => {
    const offset = (page - 1) * itemInPage;
    const sql = `
      SELECT 
        manufacturer.id AS manu_id,
        manufacturer.name AS manu_name,
        products.id AS product_id,
        products.name AS product_name,
        products.id_manu,
        products.category_id,
        products.thumbnail,
        products.price,
        products.discount,
        products.quantity,
        products.slug AS product_slug,
        products.other_discount,
        products.description,
        products.createAt AS product_createAt,
        IFNULL(products.quantity - IFNULL(b.dtb_quantity, 0), 0) AS remaining_quantity
      FROM products
      LEFT JOIN (
        SELECT 
          detail_bill.id_product AS dtb_id_product,
          SUM(detail_bill.quantity) AS dtb_quantity
        FROM detail_bill
        INNER JOIN bill ON detail_bill.id_bill = bill.id AND bill.status < 3
        GROUP BY detail_bill.id_product
      ) AS b ON products.id = b.dtb_id_product
      LEFT JOIN manufacturer ON manufacturer.id = products.id_manu
      ${querySearch}
      ORDER BY products.price ${sort}
      LIMIT ?, ?
    `;
    queryParams.push(offset, parseInt(itemInPage));

    mysql.query(sql, queryParams, function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.forEach((item, index) => {
          if (item.product_createAt) {
            item.product_createAt = dayjs(item.product_createAt).format("YYYY-MM-DD");
          }
          item.key = item.product_id;
        });
        result({
          status: true,
          data,
          totalPage,
          totalItem
        });
      }
    });
  };

  const sqlCount = `
    SELECT COUNT(*) AS total
    FROM products
    LEFT JOIN manufacturer ON manufacturer.id = products.id_manu
    ${querySearch}
  `;
  mysql.query(sqlCount, queryParams, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      const totalItem = data[0].total;
      const totalPage = Math.ceil(totalItem / itemInPage);
      querySelect(totalPage, totalItem);
    }
  });
};

Products.getBySlug = function (slug, result) {
  const query = `
    SELECT 
      products.id AS product_id,
      products.name AS product_name,
      products.id_manu,
      products.thumbnail,
      products.price,
      products.discount,
      products.quantity,
      products.slug AS product_slug,
      products.other_discount,
      products.description,
      IFNULL(products.quantity - IFNULL(b.dtb_quantity, 0), 0) AS remaining_quantity,
      manufacturer.name AS manufacturer_name
    FROM products
    LEFT JOIN (
      SELECT 
        detail_bill.id_product AS dtb_id_product, 
        SUM(detail_bill.quantity) AS dtb_quantity
      FROM detail_bill
      INNER JOIN bill ON detail_bill.id_bill = bill.id
      WHERE bill.status < 3
      GROUP BY detail_bill.id_product
    ) AS b ON products.id = b.dtb_id_product
    LEFT JOIN manufacturer ON products.id_manu = manufacturer.id
    WHERE products.slug = ?
    LIMIT 1;
  `;

  mysql.query(query, [slug], (err, data) => {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: data[0] || null });
    }
  });
};

Products.getBySlugManu = function (slug, min, max, sort, page, itemInPage, result) {
  mysql.query(
    `SELECT 
      products.id as product_id, 
      products.id_manu, 
      products.name as product_name,
      manufacturer.name as mn_name, 
      products.thumbnail, 
      products.price,
      products.discount, 
      ((products.price - products.price / 100 * products.discount) - 
      (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) as final_price, 
      products.quantity,
      products.slug as product_slug, 
      products.other_discount, 
      ratting_comment.star, 
      ratting_comment.parent_id, 
      properties.cpu, 
      properties.ram, 
      properties.screen_size, 
      properties.hard_disk 
    FROM 
      products 
    LEFT JOIN 
      ratting_comment ON products.id = ratting_comment.id_product 
    LEFT JOIN 
      properties ON products.id = properties.id_product 
    LEFT JOIN 
      manufacturer ON products.id_manu = manufacturer.id 
    WHERE 
      manufacturer.slug = ?  
      AND 
      ((products.price - products.price / 100 * products.discount) - 
      (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) 
      BETWEEN ? AND ? 
    ORDER BY 
      final_price ${mysql.escape(sort)} 
    LIMIT ?, ?`,
    [slug, min, max, (page - 1) * itemInPage, itemInPage],
    function (err, data) {
      if (err) {
        console.error("Database Error:", err);
        return result({ status: false, data: "Database query failed" });
      }

      let uniqueData = data.reduce((acc, current) => {
        if (!acc.find((item) => item.product_id === current.product_id)) {
          acc.push(current);
        }
        return acc;
      }, []);

      uniqueData.forEach((item) => {
        let dataStar = [0, 0, 0, 0, 0];
        let totalStar = 0;

        data.forEach((it) => {
          if (item.product_id === it.product_id && it.parent_id === null) {
            if (it.star >= 1 && it.star <= 5) {
              dataStar[it.star - 1] += 1;
              totalStar += 1;
            }
          }
        });

        let a = dataStar.reduce((sum, value, index) => sum + value * (index + 1), 0);
        let b = totalStar;
        item.starType = b > 0 ? Math.round(a / b) : 0;
        item.point = b > 0 ? (a / b).toFixed(1) : 0;
        item.totalStar = totalStar;
        delete item.star;
      });

      let totalPage = Math.ceil(uniqueData.length / itemInPage);
      let dataResponse = uniqueData.slice((page - 1) * itemInPage, page * itemInPage);

      result({
        status: true,
        data: dataResponse,
        totalPage: totalPage
      });
    }
  );
};

Products.getById = function (id, result) {
  const query = `
    SELECT 
      p.*, 
      p.id AS id_product, 
      p.name AS product_name,  
      IFNULL(p.quantity - IFNULL(b.dtb_quantity, 0), 0) AS remaining_quantity, 
      GROUP_CONCAT(img.path_name) AS images 
    FROM products p 
    LEFT JOIN (
      SELECT 
        detail_bill.id_product AS dtb_id_product, 
        SUM(detail_bill.quantity) AS dtb_quantity
      FROM detail_bill
      INNER JOIN bill ON detail_bill.id_bill = bill.id
      WHERE bill.status < 3
      GROUP BY detail_bill.id_product
    ) AS b ON p.id = b.dtb_id_product
    LEFT JOIN img_description img ON p.id = img.id_product 
    WHERE p.id = ? 
    GROUP BY p.id
  `;

  mysql.query(query, [id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      if (data.length > 0) {
        const product = data[0];
        product.images = product.images ? product.images.split(",") : [];
        result({ status: true, data: [product] });
      } else {
        result({ status: false, data: "Product not found" });
      }
    }
  });
};

// ORDER BY RAND() LIMIT 20
Products.getRandom = function (result) {
  mysql.query(
    "SELECT products.id as product_id, products.id_manu, products.name as product_name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY RAND() LIMIT 20",
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        let newData = [];

        for (let index = 1; index < data.length; index++) {
          if (index === 1) {
            newData.push(data[index - 1]);
          }
          if (data[index].product_id !== data[index - 1].product_id) {
            newData.push(data[index]);
          }
        }
        newData.map((item) => {
          let dataStar = [0, 0, 0, 0, 0];
          let totalStar = 0;
          data.map((it) => {
            if (item.product_id == it.product_id && it.parent_id === null) {
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
          let a = 1 * dataStar[0] + 2 * dataStar[1] + 3 * dataStar[2] + 4 * dataStar[3] + 5 * dataStar[4];
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

Products.search = function (query, min, max, sort, page, itemInPage, result) {
  mysql.query(
    `SELECT products.id as product_id, products.id_manu, products.name as product_name , products.thumbnail, products.price,products.discount, ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) as final_price, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk, manufacturer.name as mn_name FROM products LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product LEFT JOIN manufacturer ON products.id_manu = manufacturer.id WHERE products.name COLLATE utf8mb4_unicode_ci LIKE '%${query}%' AND ((products.price - products.price / 100 * products.discount) - (products.price - products.price / 100 * products.discount) / 100 * products.other_discount) BETWEEN ${min} AND ${max} ORDER BY final_price ${sort} `,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        let newData = [];

        for (let index = 1; index < data.length; index++) {
          if (index === 1) {
            newData.push(data[index - 1]);
          }
          if (data[index].product_id !== data[index - 1].product_id) {
            newData.push(data[index]);
          }
        }
        newData.map((item) => {
          let dataStar = [0, 0, 0, 0, 0];
          let totalStar = 0;
          data.map((it) => {
            if (item.product_id == it.product_id && it.parent_id === null) {
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
          let a = 1 * dataStar[0] + 2 * dataStar[1] + 3 * dataStar[2] + 4 * dataStar[3] + 5 * dataStar[4];
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
          if (index >= page * itemInPage - itemInPage && index < page * itemInPage) {
            dataResponse.push(item);
          }
        });
        result({
          status: true,
          data: dataResponse,
          totalPage: Math.floor(totalPage)
        });
      }
    }
  );
};
// ORDER BY other_discount DESC LIMIT 10
// SELECT * FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product ORDER BY products.other_discount DESC LIMIT 20
Products.getBigSaleProduct = function (result) {
  mysql.query(
    "SELECT products.id, products.id_manu, products.name as product_name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY products.other_discount  DESC LIMIT 20",
    function (err, data) {
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
          let a = 1 * dataStar[0] + 2 * dataStar[1] + 3 * dataStar[2] + 4 * dataStar[3] + 5 * dataStar[4];
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

Products.getNewProduct = function (result) {
  mysql.query(
    "SELECT products.id as product_id, products.id_manu, products.name as product_name, products.thumbnail, products.price,products.discount, products.quantity,products.slug as product_slug, products.other_discount, ratting_comment.star, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM `products` LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product ORDER BY products.createAt DESC LIMIT 20",
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        let newData = [];

        for (let index = 1; index < data.length; index++) {
          if (index === 1) {
            newData.push(data[index - 1]);
          }
          if (data[index].product_id !== data[index - 1].product_id) {
            newData.push(data[index]);
          }
        }
        newData.map((item) => {
          let dataStar = [0, 0, 0, 0, 0];
          let totalStar = 0;
          data.map((it) => {
            if (item.product_id == it.product_id && it.parent_id === null) {
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
          let a = 1 * dataStar[0] + 2 * dataStar[1] + 3 * dataStar[2] + 4 * dataStar[3] + 5 * dataStar[4];
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
Products.getHotProduct = function (result) {
  mysql.query(
    "SELECT products.id as product_id,products.id_manu, products.name as product_name, products.thumbnail,products.price,products.discount, products.quantity, products.slug as product_slug,products.other_discount ,ratting_comment.star, ratting_comment.content, ratting_comment.parent_id, properties.cpu, properties.ram, properties.screen_size, properties.hard_disk FROM products LEFT JOIN ratting_comment ON products.id = ratting_comment.id_product LEFT JOIN properties ON products.id = properties.id_product INNER JOIN (SELECT products.id, SUM(detail_bill.quantity) AS total FROM products LEFT JOIN detail_bill ON products.id = detail_bill.id_product GROUP BY detail_bill.id_product ORDER BY total DESC LIMIT 20) AS TB2 WHERE products.id = TB2.id",
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        let newData = [];

        for (let index = 1; index < data.length; index++) {
          if (index === 1) {
            newData.push(data[index - 1]);
          }
          if (data[index].product_id !== data[index - 1].product_id) {
            newData.push(data[index]);
          }
        }
        newData.map((item) => {
          let dataStar = [0, 0, 0, 0, 0];
          let totalStar = 0;
          data.map((it) => {
            if (item.product_id == it.product_id && it.parent_id === null) {
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
          let a = 1 * dataStar[0] + 2 * dataStar[1] + 3 * dataStar[2] + 4 * dataStar[3] + 5 * dataStar[4];
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

Products.create = async function (formData, result) {
  mysql.query("INSERT INTO `products` SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
      return;
    }
    const productId = data.insertId;
    if (formData.thumbnail) {
      const imgData = { id_product: productId, path_name: formData.thumbnail };
      mysql.query("INSERT INTO `img_description` SET ?", imgData, function (imgErr) {
        if (imgErr) {
          result({ status: false, data: imgErr });
          return;
        }
        result({ status: true, data: { id: productId, ...formData } });
      });
    } else {
      result({ status: true, data: { id: productId, ...formData } });
    }
  });
};

Products.update = function (id, formData, result) {
  mysql.query("UPDATE `products` SET ? WHERE id=?", [formData, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: id, ...formData } });
    }
  });
};

Products.remove = function (id, result) {
  mysql.query(
    `SELECT
      (SELECT COUNT(*) FROM \`detail_bill\` WHERE \`id_product\` = ?) AS bill_count,
      (SELECT COUNT(*) FROM \`cart\` WHERE \`id_product\` = ?) AS cart_count`,
    [id, id],
    function (err, data) {
      if (err) {
        return result({ status: false, data: err });
      }

      if (data[0].bill_count > 0) {
        return result({ status: false, data: "Sản phẩm đang được sử dụng trong hóa đơn, không thể xóa!" });
      }

      if (data[0].cart_count > 0) {
        return result({ status: false, data: "Sản phẩm đang được sử dụng trong giỏ hàng, không thể xóa!" });
      }

      mysql.query("DELETE FROM `products` WHERE `id` = ?", [id], function (err, data) {
        if (err) {
          return result({ status: false, data: err });
        }
        return result({ status: true, data: "Xóa dữ liệu thành công!" });
      });
    }
  );
};

Products.updateQuantity = function (formData, result) {
  if (formData.type == "minus") {
    mysql.query(`UPDATE products SET quantity = quantity - ${formData.quantity} WHERE id = ${formData.id_product}`, function (err, data) {
      if (err) {
        result({ Success: false, Message: err });
      } else {
        result({ Success: true, data: formData.id_product });
      }
    });
  }
  if (formData.type == "add") {
    mysql.query(`UPDATE products SET quantity = quantity + ${formData.quantity} WHERE id = ${formData.id_product}`, function (err, data) {
      if (err) {
        result({ Success: false, Message: err });
      } else {
        result({ Success: true, data: formData.id_product });
      }
    });
  }
};

module.exports = Products;
