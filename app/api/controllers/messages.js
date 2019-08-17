const Message = require('../models/message');
const User = require('../models/users');

const ServerError = require('../config/serverError');

module.exports = {
	create: function(req, res, next) {
		if (!req.body.recipient) next(new ServerError('Missing recipient parameter', 'error', 500));
		else if (!req.body.content) next(new ServerError('Missing content parameter', 'error', 500));
		else { 
			let message = new Message(req.body);
			message.sender = req.body.userId;
			User.findOne({name: req.body.recipient}, (err, user) => {
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
		Message.find({recipient: req.body.userId}).populate({
			path: 'sender',
			select: 'namme'
		}).exec((err, messages) => {
			res.json(messages);
		});
	}
};