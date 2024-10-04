const News = require("../models/News");

var slugify = require('slugify')

class NewsController {
    //[GET] / news/get-by-category
    getBySlugCategory(req, res, next) {
        const slug = req.params.slug;
        var data = require("url").parse(req.url, true).query;
        const page = data.page;
        const itemInPage = data.item

        News.getBySlugCategory(slug, page, itemInPage, function(data) {
            res.json(data);
        });
    }

    //[GET] / news/get-by-slug
    getBySlug(req, res, next) {
        const slug = req.params.slug;

        News.getBySlug(slug, function(data) {
            res.json(data);
        });
    }

    //[GET] / news/get-by-id
    getById(req, res, next) {
        const id = req.params.id;

        News.getById(id, function(data) {
            res.json(data);
        });
    }

    //[GET] / news/get-by-admin
    getAllByAdmin(req, res, next) {
        var data = require("url").parse(req.url, true).query;
        const query = data.query;
        const category = data.category;
        const page = data.page;
        const itemInPage = data.item

        News.getAllByAdmin(query, category, page, itemInPage, function(data) {
            res.json(data);
        });
    }

    //[POST] / news / create
    create(req, res) {
        const formData = req.body;
        formData.slug = slugify(formData.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: false,
            locale: 'vi',
            trim: true
        });

        News.create(formData, function(data) {
            res.json(data);
        });
    }

    //[PUT] / news  / :id / update
    update(req, res) {
        const id = req.params.id;
        const formData = req.body;

        formData.slug = slugify(formData.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: false,
            locale: 'vi',
            trim: true
        });

        News.update(id, formData, function(data) {
            res.json(data);
        });
    }

    //[DELETE] / news / :id / remove
    remove(req, res) {
        const id = req.params.id;

        News.remove(id, function(data) {
            res.json(data);
        });
    }

}
module.exports = new NewsController();