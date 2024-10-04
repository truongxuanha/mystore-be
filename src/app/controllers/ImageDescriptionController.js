const ImageDescription = require('../models/ImageDescription')

class ImageDescriptionController {
    //[GET] /image_description
    index(req, res) {
        ImageDescription.getAll(function (data) {
            res.json(data)
        })
    }

    //[GET] /image_description/:id
    getByIdProduct(req, res) {
        const id = req.params.id

        ImageDescription.getByIdProduct(id, function (data) {
            res.json(data)
        })
    }

    //[POST] /image_description/create
    create(req, res) {
        const formData = req.body

        ImageDescription.create(formData, function (data) {
            res.json(data)
        })
    }

    //[DELETE] /image_description/:id/remove
    remove(req, res) {
        const id = req.params.id

        ImageDescription.remove(id, function (data) {
            res.json(data)
        })
    }
}
module.exports = new ImageDescriptionController