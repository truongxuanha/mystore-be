const manufacturerRouter = require("./manufacturer");
const productRouter = require("./products");
const accountRouter = require("./account");
const addressRouter = require("./address");
const imgDescriptionRouter = require("./imageDescription");
const billRouter = require("./bill");
const detailBillRouter = require("./detailBill");
const rattingCommentRouter = require("./rattingcomment");
const commentRouter = require("./comment");
const cartRouter = require("./cart");
const bannerRouter = require("./banner");
const revenueRouter = require("./revenue");
const salePopupRouter = require("./salePopup");
const category = require("./productCategory");
function route(app) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin,X-Requested-With, Content-Type, Accept, Authorization, *");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
    next();
  });
  app.use("/v1/product", productRouter);
  app.use("/v1/manufacturer", manufacturerRouter);
  app.use("/v1/account", accountRouter);
  app.use("/v1/address", addressRouter);
  app.use("/v1/image_description", imgDescriptionRouter);
  app.use("/v1/bill", billRouter);
  app.use("/v1/detail-bill", detailBillRouter);
  app.use("/v1/ratting-comment", rattingCommentRouter);
  app.use("/v1/comment", commentRouter);
  app.use("/v1/cart", cartRouter);
  app.use("/v1/banner", bannerRouter);
  app.use("/v1/revenue", revenueRouter);
  app.use("/v1/salepopup", salePopupRouter);
  app.use("/v1/category-product", category);
}

module.exports = route;
