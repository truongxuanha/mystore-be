const express = require("express");
const router = express.Router();
const categoryProduct = require("../app/controllers/ProductCategoryController");
router.get("/category-all", categoryProduct.getAllCagegory);

module.exports = router;
