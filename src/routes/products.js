const express = require("express");
const router = express.Router();
const upload = require("../until/upload");

const productController = require("../app/controllers/ProductController");
const middleWareController = require("../app/controllers/MiddleWareController");

router.get("/", productController.index);

router.get("/get-all", productController.getAllByAdmin);

router.get("/big_sale", productController.getBigSale);

router.get("/new_product", productController.getNewProduct);

router.get("/hot_product", productController.getHotroduct);

router.post("/create", upload.single("thumbnail"), middleWareController.verifyTokenAndAdminAuth, productController.create);

router.get("/search", productController.search);

router.get("/random", productController.getRandom);

router.get("/:slug", productController.getBySlug);

router.get("/:id/get_one", productController.getById);

router.get("/:slug/get_by_slug_manu", productController.getBySlugManu);

router.put("/:id/update", upload.single("thumbnail"), middleWareController.verifyTokenAndAdminAuth, productController.update);

router.delete("/:id/remove", middleWareController.verifyTokenAndAdminAuth, productController.remove);

router.patch("/update-quantity", middleWareController.verifyToken, productController.updateQuantity);

module.exports = router;
