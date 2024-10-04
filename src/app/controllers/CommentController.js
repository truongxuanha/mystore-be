const Comment = require('../models/Comment');

class CommentController {
    //[GET] / comment/:id/getByIdProduct
    getByIdProduct(req, res, next) {
        const id = req.params.id;
        var data = require('url').parse(req.url, true).query;
        const page = data.page;
        const itemInPage = data.item;
        const sort = data.sort;

        Comment.getByIdProduct(id, sort, page, itemInPage, function(data) {
            res.json(data);
        });
    }

    //[GET] / comment/:id/getById
    getById(req, res, next) {
        const id = req.params.id;

        Comment.getById(id, function(data) {
            res.json(data);
        });
    }

    //[POST] / comment/:id/create
    create(req, res, next) {
        const formData = req.body;
        formData.id_account = req.dataToken.id;

        Comment.create(formData, function(data) {
            res.json(data);
        });
    }

    //[PUT] / comment/:id/update
    update(req, res, next) {
        const formData = req.body;
        const id = req.params.id;

        Comment.update(id, formData, function(data) {
            res.json(data);
        });
    }

    //[DELETE] / comment/:id/remove
    remove(req, res, next) {
        const id = req.params.id;

        Comment.remove(id, function(data) {
            res.json(data);
        });
    }
}

module.exports = new CommentController();