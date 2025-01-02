const RattingComment = require("../models/RattingComment");

class RattingCommentController {
  //[GET] / rattingcomment/:id/get-By-Id-Product
  getByIdProduct(req, res, next) {
    const id = req.params.id;
    var data = require("url").parse(req.url, true).query;
    const page = data.page;
    const itemInPage = data.item;
    const sort = data.sort;
    const star = data.star;
  
    RattingComment.getByIdProduct(id, page, itemInPage, sort, star, function (data) {
      res.json(data);
    });
  }
  //[GET] / rattingcomment/:id/get-all-by-id-product
  getAllByIdProduct(req, res, next) {
    const id = req.params.id;
    RattingComment.getAllByIdProduct(id, function (data) {
      res.json(data);
    });
  }

  //[POST] / rattingcomment/:id/create
  create(req, res, next) {
    const formData = req.body;
    formData.id_account = req.dataToken.id;
    RattingComment.create(formData, function (data) {
      res.json(data);
    });
  }

  //[GET] / rattingcomment/getall
  getAll(req, res, next) {
    RattingComment.getAll(function (data) {
      res.json(data);
    });
  }

  //[GET] / rattingcomment/discountproduct
  getByDiscountProduct(req, res, next) {
    RattingComment.getBySortDiscount(function (data) {
      res.json(data);
    });
  }

  //[GET] / rattingcomment/newproduct
  getByNewProduct(req, res, next) {
    RattingComment.getByNewProduct(function (data) {
      res.json(data);
    });
  }
  //[GET] / rattingcomment/getByid
  getById(req, res, next) {
    const id = req.params.id;

    RattingComment.getById(id, function (data) {
      res.json(data);
    });
  }

  //[PUT] / rattingcomment/update
  update(req, res, next) {
    const id = req.params.id;
    const formData = req.body;

    RattingComment.update(formData, id, function (data) {
      res.json(data);
    });
  }

  //[Delete] / rattingcomment/remove_reply
  removeReply(req, res, next) {
    const id = req.params.id;

    RattingComment.removeReply(id, function (data) {
      res.json(data);
    });
  }

  //[Delete] / rattingcomment/remove_reply
  removebyid(req, res, next) {
    const id = req.params.id;

    RattingComment.removebyid(id, function (data) {
      res.json(data);
    });
  }
}

module.exports = new RattingCommentController();
