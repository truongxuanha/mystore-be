const express = require("express");
const router = express.Router();

const billController = require("../app/controllers/BillController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/get-by-account", middleWareController.verifyToken, billController.getByAccount);

router.get("/get-all", middleWareController.verifyTokenAndAdminAuth, billController.getAllByAdmin);

router.get("/:status/get-by-status", billController.getByStatus);

router.put("/:id/update", middleWareController.verifyToken, billController.update);

router.put("/:id/update-status", middleWareController.verifyTokenAndAdminAuth, billController.updateStatus);

router.post("/create", middleWareController.verifyToken, billController.create);

router.delete("/:id/remove", middleWareController.verifyToken, billController.remove);

router.delete("/:id/remove-by-admin", middleWareController.verifyTokenAndAdminAuth, billController.removeByAdmin);

module.exports = router;
