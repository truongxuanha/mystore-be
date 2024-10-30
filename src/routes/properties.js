const express = require("express");
const router = express.Router();

const propertiesController = require("../app/controllers/PropertiesController");

router.get("/:id", propertiesController.getByIdProduct);

router.put("/:id/update", propertiesController.update);

router.delete("/:id/remove", propertiesController.remove);

router.post("/create", propertiesController.create);

router.post("/addcolumn", propertiesController.addColumn);

router.post("/dropcolumn", propertiesController.dropColumn);

router.get("/", propertiesController.index);

module.exports = router;
