const mysql = require("../../config/mysql_db");
const SalePopup = function (salePopup) {
  this.popup_id = salePopup.popup_id;
  this.popup_img = salePopup.popup_img;
  this.id_account = salePopup.id_account;
};
SalePopup.getPopupByAcc = function (result) {
  mysql.query("SELECT popup_id, popup_img, url_transit FROM salepopup ", function (error, data) {
    if (error) {
      result({ status: false, data: error });
    } else {
      result({ status: true, data: data });
    }
  });
};
module.exports = SalePopup;
