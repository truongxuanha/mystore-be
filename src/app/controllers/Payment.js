const dayjs = require("dayjs");
const { VNPay, ignoreLogger } = require("vnpay");
const mysql = require("../../config/mysql_db");
require("dotenv").config();
// const Bill = require("../models/Bill");
const DetailBill = require("../models/DetailBill");
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE,
  secureSecret: process.env.VNP_HASHSECRET,
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
  hashAlgorithm: "SHA512", // tùy chọn

  /**
   * Sử dụng enableLog để bật/tắt logger
   * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
   */
  enableLog: true, // optional

  /**
   * Hàm `loggerFn` sẽ được gọi để ghi log
   * Mặc định, loggerFn sẽ ghi log ra console
   * Bạn có thể ghi đè loggerFn để ghi log ra nơi khác
   *
   * `ignoreLogger` là một hàm không làm gì cả
   */
  loggerFn: ignoreLogger // optional
});
const createPaymentVNPay = async (req, res) => {
  const userId = req.dataToken.id;
  const formData = req.body;
  formData.billData.id_account = userId;
  DetailBill.create(formData.billData, formData.detailsData, formData.type, function (data) {
    if (!data.success) {
      return res.status(500).send({ message: "Failed to create order", error: data });
    }

    const orderId = data.data.billId;
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: formData.billData.total_amount_order,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: "Thanh toán cho mã GD: " + orderId,
      vnp_OrderType: "other",
      vnp_ReturnUrl: process.env.APP_URL,
      vnp_Locale: "vn",
      vnp_IpAddr: req.ip
    });

    return res.send({ paymentUrl });
  });
};

const vnpayReturn = (req, res) => {
  const { orderId, responseCode } = req.body;
  if (responseCode === "00") {
    mysql.query("UPDATE `bill` SET status = ?, paymentAt = ? WHERE id = ?", [0, new Date(), orderId], (err) => {
      if (err) {
        return res.status(500).send({ message: "Payment update failed", error: err });
      }
      return res.send({ message: "Payment successful", orderId });
    });
  } else if (responseCode === "24" || responseCode === "11") {
    deleteOrderDB(orderId, res, "Giao dịch không thành công do: Khách hàng hủy giao dịch", 24);
  } else if (responseCode === "12") {
    deleteOrderDB(orderId, res, "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa", 24);
  } else if (responseCode === "75") {
    deleteOrderDB(orderId, res, "Ngân hàng thanh toán đang bảo trì.", 75);
  } else {
    deleteOrderDB(orderId, res, "Giao dịch không thành công", 99);
  }
};
const deleteOrderDB = async (orderId, res, message, status) => {
  mysql.query("DELETE FROM `bill` WHERE id = ?", [orderId], () => {
    return res.status(402).send({ message, statusCode: status });
  });
};
/**
 * Cập nhật số lượng sản phẩm trong kho
 */
const updateInventory = (orderId, callback) => {
  mysql.query("SELECT id_product, quantity FROM detail_bill WHERE id_bill = ?", [orderId], (err, items) => {
    if (err) return callback(err);

    const queries = items.map((item) => ["UPDATE products SET quantity = quantity - ? WHERE id = ?", [item.quantity, item.id_product]]);

    queries.forEach(([query, params]) =>
      mysql.query(query, params, (err) => {
        if (err) console.error("Inventory update failed:", err);
      })
    );

    callback(null);
  });
};

/**
 * Xử lý đơn hàng sau khi thanh toán thành công
 */
const handleSuccessfulPayment = (orderId) => {
  updateInventory(orderId, (err) => {
    if (err) {
      console.error("Inventory update failed:", err);
    } else {
      console.log("Inventory updated successfully");
    }
  });
};

module.exports = {
  createPaymentVNPay,
  vnpayReturn,
  updateInventory,
  handleSuccessfulPayment
};
