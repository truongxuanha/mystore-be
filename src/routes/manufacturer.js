const express = require("express");
const router = express.Router();

const manufacturerController = require("../app/controllers/ManufacturerController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/", manufacturerController.getAll);

router.get("/get-all", middleWareController.verifyTokenAndAdminAuth, manufacturerController.getAllByAdmin);

router.get("/:id", manufacturerController.getById);

router.get("/:slug/get_by_slug", manufacturerController.getBySlug);

router.post("/create", middleWareController.verifyTokenAndAdminAuth, manufacturerController.create);

router.put("/:id/update", middleWareController.verifyTokenAndAdminAuth, manufacturerController.update);

router.delete("/:id/remove", middleWareController.verifyTokenAndAdminAuth, manufacturerController.remove);

module.exports = router;
