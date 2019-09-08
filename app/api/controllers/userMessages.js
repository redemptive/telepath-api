// Models
const Message = require('../models/Message');
const User = require('../models/User');

const ServerError = require('../config/ServerError');

module.exports = {
	create: function(req, res, next) {
		if (!req.params.name) next(new ServerError('Missing recipient parameter', 'error', 500));
		else if (!req.body.content) next(new ServerError('Missing content parameter', 'error', 500));
		else { 
			let message = new Message(req.body);
			message.sender = req.body.userId;
			User.findOne({name: req.params.name}, (err, user) => {
				if (err) next(err);
				else if (!user) next(new ServerError('Unknown recipient', 'error', 500));
				else {
					message.save((err, message) => {
						if (err) next(err);
						else {
							user.messages.push(message._id);
							user.save((err) => {
								if (err) next(err);
								else {
									res.json({status: 'success', message: 'Message sent'});
								}
							});
						}
					});
				}
			});
		}
	},

	getAll: function(req, res, next) {
		User.findOne({_id: req.body.userId}).populate({
			path: 'messages',
			populate: {path: 'sender', select: 'name'}
		}).select('messages').exec((err, messages) => {
			if (err) next(err);
			else res.json(messages);
		});
	}
};