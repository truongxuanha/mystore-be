const express = require("express");
const router = express.Router();
const upload = require("../until/upload");

const imageDescriptionController = require("../app/controllers/ImageDescriptionController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/", imageDescriptionController.index);

router.get("/:id/get-by-product", imageDescriptionController.getByIdProduct);

router.post("/create", upload.single("path_name"), middleWareController.verifyTokenAndAdminAuth, imageDescriptionController.create);

router.delete("/:id/remove", middleWareController.verifyTokenAndAdminAuth, imageDescriptionController.remove);

module.exports = router;
