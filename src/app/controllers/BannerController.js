const Banner = require("../models/Banner");
const bucket = require("../../config/firebase/firebaseAdmin");

class BannerController {
  //[GET] /banner
  index(req, res) {
    Banner.getAll(function (data) {
      res.json(data);
    });
  }

  //[POST] /banner/create
  create(req, res) {
    const formData = req.body;

    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded." });
    }

    const filePath = `public/banner/${req.file.originalname}`;
    const blob = bucket.file(filePath);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype
      }
    });

    blobStream.on("error", (err) => {
      return res.status(500).json({ status: false, message: "Failed to upload image", error: err });
    });

    blobStream.on("finish", () => {
      const encodedBlobName = encodeURIComponent(blob.name);
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedBlobName}?alt=media`;

      formData.image = publicUrl;
      Banner.create(formData, function (data) {
        res.json(data);
      });
    });

    blobStream.end(req.file.buffer);
  }

  //[PUT] /banner/:id/update
  update(req, res) {
    const id = req.params.id;
    const formData = req.body;
    console.log(formData);

    if (req.file) {
      const filePath = `public/banner/${req.file.originalname}`;
      const blob = bucket.file(filePath);

      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype
        }
      });

      blobStream.on("error", (err) => {
        return res.status(500).json({ status: false, message: "Failed to upload image", error: err });
      });

      blobStream.on("finish", async () => {
        const encodedBlobName = encodeURIComponent(blob.name);
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedBlobName}?alt=media`;
        formData.image = publicUrl;
        Banner.getById(id, async function (banner) {
          if (banner.image) {
            const oldImagePath = decodeURIComponent(banner.image.split("/o/")[1].split("?")[0]);
            await bucket
              .file(oldImagePath)
              .delete()
              .catch(() => {});
          }
          Banner.update(id, formData, function (data) {
            res.json(data);
          });
        });
      });

      blobStream.end(req.file.buffer);
    } else {
      Banner.update(id, formData, function (data) {
        res.json(data);
      });
    }
  }

  //[DELETE] /banner/:id/remove
  remove(req, res) {
    const id = req.params.id;
    Banner.getById(id, async function (banner) {
      if (banner.image) {
        const imagePath = decodeURIComponent(banner.image.split("/o/")[1].split("?")[0]);
        await bucket
          .file(imagePath)
          .delete()
          .catch(() => {});
      }
      Banner.remove(id, function (data) {
        res.json(data);
      });
    });
  }
}

module.exports = new BannerController();
