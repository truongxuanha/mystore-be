const SalePopup = require("../models/SalePopup");

class SalePopupController {
  getPopupByAcc(req, res) {
    // console.log(req.dataToken.id);

    // if (!req.dataToken || !req.dataToken.id) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Missing or invalid token data"
    //   });
    // }
    // const id = req.dataToken.id;
    SalePopup.getPopupByAcc(function (data) {
      res.json(data);
    });
  }
}

module.exports = new SalePopupController();
