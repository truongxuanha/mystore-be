const express = require("express");
const router = express.Router();

const commentController = require("../app/controllers/CommentController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/:id/get-by-product", commentController.getByIdProduct);

router.get("/:id/get-by-id", commentController.getById);

router.put("/:id/update", middleWareController.verifyToken, commentController.update);

router.delete("/:id/remove", middleWareController.verifyToken, commentController.remove);

router.post("/create", middleWareController.verifyToken, commentController.create);

module.exports = router;
