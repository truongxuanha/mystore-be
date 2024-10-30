const express = require("express");
const router = express.Router();

const middleWareController = require("../app/controllers/MiddleWareController");
const addressController = require("../app/controllers/AddressController");

router.get("/", addressController.index);

router.get("/:id/get-by-account", middleWareController.verifyTokenAndAdminAuth, addressController.getAddressByAccount);

router.get("/:id/get-by-bill", middleWareController.verifyTokenAndAdminAuth, addressController.getByBill);

router.get("/get-by-account", middleWareController.verifyToken, addressController.getByIdAccount);

router.get("/:id/get-by-id", middleWareController.verifyToken, addressController.getById);

router.post("/create", middleWareController.verifyToken, addressController.create);

router.put("/:id/update", middleWareController.verifyToken, addressController.update);

router.delete("/:id/remove", middleWareController.verifyToken, addressController.remove);

module.exports = router;
