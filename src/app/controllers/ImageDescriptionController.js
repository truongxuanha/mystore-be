const ImageDescription = require("../models/ImageDescription");
const { uploadToFirebase } = require("../../until/uploadToFirebase");

class ImageDescriptionController {
  //[GET] /image_description
  index(req, res) {
    ImageDescription.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] /image_description/:id
  getByIdProduct(req, res) {
    const id = req.params.id;

    ImageDescription.getByIdProduct(id, function (data) {
      res.json(data);
    });
  }

  //[POST] /image_description/create
  async create(req, res) {
    const { id_product } = req.body;
    if (!id_product) {
      return res.status(400).json({ status: false, message: "Product ID is required." });
    }
    try {
      const publicUrl = await uploadToFirebase(req.file, "public/image_description");
      const formData = {
        id_product: Number(id_product),
        path_name: publicUrl
      };

      ImageDescription.create(formData, (data) => {
        res.json(data);
      });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  //[DELETE] /image_description/:id/remove
  async remove(req, res) {
    const id = req.params.id;

    ImageDescription.getByIdProduct(id, async function (result) {
      if (result.status && result.data.length > 0) {
        try {
          const imagePath = decodeURIComponent(result.data[0].path_name.split("/o/")[1].split("?")[0]);
          await bucket.file(imagePath).delete();
          ImageDescription.remove(id, (data) => {
            res.json(data);
          });
        } catch (error) {
          res.status(500).json({ status: false, message: "Failed to delete image from Firebase.", error: error.message });
        }
      } else {
        res.status(404).json({ status: false, message: "Image not found!" });
      }
    });
  }
}
module.exports = new ImageDescriptionController();
