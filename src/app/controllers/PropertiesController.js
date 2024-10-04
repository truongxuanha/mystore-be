const Properties = require('../models/Properties')

class PropertiesController {
    //[GET] / properties
    index(req, res, next) {
        Properties.getAll(function(data) {
            res.json(data)
        })
    }

    //[GET] / properties/:id
    getByIdProduct(req, res, next) {
        const id = req.params.id

        Properties.getByIdProduct(id, function(data) {
            res.json(data)
        })
    }

    //[POST] / properties/create
    create(req, res, next) {
        const formData = req.body

        Properties.create(formData, function(data) {
            res.json(data)
        })
    }

    //[PUT] / properties/:id/update
    update(req, res, next) {
        const id = req.params.id

        const formData = req.body

        Properties.update(id, formData, function(data) {
            res.json(data)
        })
    }

    //[DELETE] / properties/:id/remove
    remove(req, res, next) {
        const id = req.params.id

        Properties.remove(id, function(data) {
            res.json(data)
        })
    }

    //[POST] / properties/addcolumn
    addColumn(req, res, next) {
        const formData = req.body

        Properties.addColumn(formData, function(data) {
            res.json(data)
        })
    }

    //[POST] / properties/delete
    dropColumn(req, res, next) {
        const formData = req.body

        Properties.dropColumn(formData, function(data) {
            res.json(data)
        })
    }

}
module.exports = new PropertiesController