const mysql = require("../../config/mysql_db");
const dayjs = require("dayjs");

const News = function () {};

News.getBySlugCategory = function (slug, page, itemInPage, result) {
  const querySelect = (totalPage, totalItem) => {
    mysql.query(
      `SELECT news.id,news.name,news.description, news.id_category, news.thumbnail,news_category.name as news_category_name, news.content, news.slug, news.createdAt FROM news, news_category WHERE news_category.id = news.id_category AND news_category.slug = '${slug}' ORDER BY createdAt DESC LIMIT ${
        itemInPage * page - itemInPage
      },${itemInPage}`,
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          data.map((item, index) => {
            if (item.createdAt) {
              let crtA = dayjs(item.createdAt);
              item.createdAt = crtA.format("YYYY-MM-DD").toString();
            }
            if (item.updatedAt) {
              let udA = dayjs(item.updatedAt);
              item.updatedAt = udA.format("YYYY-MM-DD").toString();
            }
            item.key = index;
          });
          result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem });
        }
      }
    );
  };
  mysql.query(
    `SELECT news.id, news.id_category, news.thumbnail, news.content, news.slug, news.createdAt FROM news, news_category WHERE news_category.id = news.id_category AND news_category.slug = '${slug}' ORDER BY createdAt DESC`,
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

News.getBySlug = function (slug, result) {
  mysql.query(
    `SELECT news.id as news_id, news.name as news_name,news.description, news_category.id, news_category.name, news_category.slug, account.account_name, news.content,news.slug as news_slug, news.createdAt FROM news, account, news_category WHERE news.id_account = account.id AND news.id_category = news_category.id AND news.slug = '${slug}'`,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.map((item, index) => {
          if (item.createdAt) {
            let crtA = dayjs(item.createdAt);
            item.createdAt = crtA.format("YYYY-MM-DD").toString();
          }
        });
        result({ status: true, data: data });
      }
    }
  );
};

News.getById = function (id, result) {
  mysql.query(
    `SELECT news.id as news_id, news.name as news_name,news.description, news_category.id, news_category.name, news_category.slug, account.account_name, news.content,news.slug as news_slug, news.createdAt FROM news, account, news_category WHERE news.id_account = account.id AND news.id_category = news_category.id AND news.id = '${id}'`,
    function (err, data) {
      if (err) {
        result({ status: false, data: err });
      } else {
        data.map((item, index) => {
          if (item.createdAt) {
            let crtA = dayjs(item.createdAt);
            item.createdAt = crtA.format("YYYY-MM-DD").toString();
          }
        });
        result({ status: true, data: data });
      }
    }
  );
};

News.getAllByAdmin = function (query, newsCategory, page, itemInPage, result) {
  let querySearch = "";
  let queryNewsCategory = "";
  if (query !== "") {
    querySearch = `AND (news.id LIKE '%${query}%' OR news.name LIKE '%${query}%')`;
  }
  if (newsCategory === "all") {
    queryNewsCategory = "";
  } else {
    queryNewsCategory = `AND news_category.id = '${newsCategory}'`;
  }
  const querySelect = (totalPage, totalItem) => {
    mysql.query(
      `SELECT news.id as news_id,news.description, news.name as news_name,news.thumbnail, news_category.id, news_category.name, news_category.slug, account.account_name, news.content,news.slug as news_slug, news.createdAt FROM news, account, news_category WHERE news.id_account = account.id AND news.id_category = news_category.id ${querySearch} ${queryNewsCategory} ORDER BY news.createdAt DESC LIMIT ${
        itemInPage * page - itemInPage
      },${itemInPage}`,
      function (err, data) {
        if (err) {
          result({ status: false, data: err });
        } else {
          data.map((item, index) => {
            if (item.createdAt) {
              let crtA = dayjs(item.createdAt);
              item.createdAt = crtA.format("YYYY-MM-DD").toString();
            }
            item.key = index;
          });
          result({ status: true, data: data, totalPage: totalPage, totalItem: totalItem });
        }
      }
    );
  };

  mysql.query(
    `SELECT news.id as news_id, news.name as news_name,news.thumbnail, news_category.id, news_category.name, news_category.slug, account.account_name, news.content,news.slug as news_slug, news.createdAt FROM news, account, news_category WHERE news.id_account = account.id AND news.id_category = news_category.id ${querySearch} ${queryNewsCategory} ORDER BY news.createdAt DESC`,
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

News.create = function (formData, result) {
  mysql.query("INSERT INTO news SET ?", formData, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { id: data.insertId, ...formData } });
    }
  });
};

News.update = function (id, formData, result) {
  mysql.query("UPDATE `news` SET ? WHERE id =?", [formData, id], function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true, data: { formData } });
    }
  });
};

News.remove = function (id, result) {
  mysql.query("DELETE FROM `news` WHERE id =?", id, function (err, data) {
    if (err) {
      result({ status: false, data: err });
    } else {
      result({ status: true });
    }
  });
};

module.exports = News;
