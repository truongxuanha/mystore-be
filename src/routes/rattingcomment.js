const express = require("express");
const router = express.Router();

const middleWareController = require("../app/controllers/MiddleWareController");
const rattingCommentController = require("../app/controllers/RattingCommentController");

router.get("/:id/comment", rattingCommentController.getByIdProduct);

router.get("/:id/get-all-by-id-product", rattingCommentController.getAllByIdProduct);

router.get("/getall", rattingCommentController.getAll);

router.get("/getbydiscount", rattingCommentController.getByDiscountProduct);

router.get("/:id/getbyid", rattingCommentController.getById);

router.delete("/:id/remove_reply", middleWareController.verifyToken, rattingCommentController.removeReply);

router.delete("/:id/removebyid", middleWareController.verifyToken, rattingCommentController.removebyid);

router.put("/:id/update", middleWareController.verifyToken, rattingCommentController.update);

router.get("/getbynewproduct", rattingCommentController.getByNewProduct);

router.post("/create", middleWareController.verifyToken, rattingCommentController.create);

module.exports = router;
