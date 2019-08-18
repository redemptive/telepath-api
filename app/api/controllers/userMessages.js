// Models
const UserMessage = require('../models/UserMessage');
const User = require('../models/User');

const ServerError = require('../config/ServerError');

module.exports = {
	create: function(req, res, next) {
		if (!req.params.name) next(new ServerError('Missing recipient parameter', 'error', 500));
		else if (!req.body.content) next(new ServerError('Missing content parameter', 'error', 500));
		else { 
			let message = new UserMessage(req.body);
			message.sender = req.body.userId;
			User.findOne({name: req.params.name}, (err, user) => {
				if (err) next(err);
				else if (!user) next(new ServerError('Unknown recipient', 'error', 500));
				else {
					message.recipient = user._id;
					message.save(function (err, result) {
						if (err) next(err);
						else res.json({status: 'success', message: 'Message sent'});
					});
				}
			});
		}
	},

	getAll: function(req, res, next) {
		UserMessage.find({recipient: req.body.userId}).populate({
			path: 'sender',
			select: 'name'
		}).exec((err, messages) => {
			res.json(messages);
		});
	}
};