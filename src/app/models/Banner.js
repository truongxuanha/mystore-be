const mysql = require("../../config/mysql_db");

class Banner {
  static getAll(callback) {
    const query = "SELECT * FROM banner";
    mysql.query(query, (err, results) => {
      if (err) {
        return callback({ status: false, message: "Failed to fetch banners", error: err });
      }
      callback({ status: true, data: results });
    });
  }

  static getById(id, callback) {
    const query = "SELECT * FROM banner WHERE id = ?";
    mysql.query(query, [id], (err, results) => {
      if (err) {
        return callback({ status: false, message: "Failed to fetch banner", error: err });
      }
      if (results.length === 0) {
        return callback({ status: false, message: "Banner not found" });
      }
      callback({ status: true, data: results[0] });
    });
  }
  static create(data, callback) {
    const query = "INSERT INTO banner (image, path) VALUES (?, ?)";
    mysql.query(query, [data.image, data.path], (err, results) => {
      if (err) {
        return callback({ status: false, message: "Failed to create banner", error: err });
      }
      callback({ status: true, message: "Banner created successfully", data: { id: results.insertId, ...data } });
    });
  }

  static update(id, data, callback) {
    const query = "UPDATE banner SET image = ?, path = ? WHERE id = ?";
    mysql.query(query, [data.image, data.path, id], (err, results) => {
      if (err) {
        return callback({ status: false, message: "Failed to update banner", error: err });
      }
      if (results.affectedRows === 0) {
        return callback({ status: false, message: "Banner not found" });
      }
      callback({ status: true, message: "Banner updated successfully", data });
    });
  }

  static remove(id, callback) {
    const query = "DELETE FROM banner WHERE id = ?";
    mysql.query(query, [id], (err, results) => {
      if (err) {
        return callback({ status: false, message: "Failed to delete banner", error: err });
      }
      if (results.affectedRows === 0) {
        return callback({ status: false, message: "Banner not found" });
      }
      callback({ status: true, message: "Banner deleted successfully" });
    });
  }
}

module.exports = Banner;
