const Post = require('../models/Post');

module.exports = {
	create: function(req, res, next) {
		let post = new Post(req.body);
		post.save(function (err) {
			if (err) next(err);
			else res.json({status: 'success', message: 'Post created'});
		});
	},

	getAll: function(req, res) {
		Post.find({}).populate('userId', 'name').exec(function(err, posts) {
			if (err) res.send(err);
			else res.json(posts);
		});
	}
};