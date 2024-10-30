const express = require("express");
const router = express.Router();

const cartController = require("../app/controllers/CartController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/get-by-account", middleWareController.verifyToken, cartController.getByAccount);

router.post("/create", middleWareController.verifyToken, cartController.create);

router.put("/:id/update", middleWareController.verifyToken, cartController.update);

router.patch("/:id/update-add-quantity", middleWareController.verifyToken, cartController.updateAddQuantity);

router.delete("/:id/remove", middleWareController.verifyToken, cartController.remove);

module.exports = router;
