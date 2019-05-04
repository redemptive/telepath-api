const Post = require('../models/posts');

module.exports = {
    create: function(req, res, next) {
        let post = new Post(req.body);
        post.save(function (err, result) {
            if (err) next(err);
            else res.json({status: "success", message: "Post created"});
        });
    },

    getAll: function(req, res, next) {
        Post.find({}, function(err, post) {
            if (err) res.send(err);
            else res.json(post);
        });
    }
}