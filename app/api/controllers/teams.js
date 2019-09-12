const Team = require('../models/Team');
const User = require('../models/User');
const ServerError = require('../config/ServerError');
const Message = require('../models/Message');

module.exports = {
	create: function(req, res, next) {
		Team.findOne({name: req.body.name}, (err, team) => {
			if (team) next(new ServerError('Team already exists!', 'error'));
			else {
				let team = new Team(req.body);
				team.save(function (err) {
					if (err) next(err);
					else res.json({status: 'success', message: 'Team created'});
				});
			}
		});
	},

	getAll: function(req, res, next) {
		Team.find({}).populate({
			path: 'users',
			select: 'name'
		}).select('-messages').exec((err, teams) => {
			if (err) res.send(err);
			else res.json(teams);
		});
	},

	getByName: function(req, res, next) {
		Team.findOne({name:req.params.name}).populate({
			path: 'users',
			select: 'name'
		}).select('-messages').exec((err, team) => {
			if (err) res.send(err);
			else if (!team) next(new ServerError('Team doesn\'t exist', 'Not found', 404));
			else res.json(team);
		});
	},

	validateMember: function(req, res, next) {
		Team.findOne({name: req.params.name}, (err, team) => {
			if (!team) next(new ServerError('Team doesn\'t exist', 'Not found', 404));
			else if (team.users.includes(req.body.userId)) next();
			else next(new ServerError('You are not a member of this team', 'Insufficient permissions', 403));		
		});
	},

	getMessages: function(req, res, next) {
		Team.findOne({name: req.params.name}).populate({
			path: 'messages',
			populate: {path: 'sender', select: 'name'}
		}).select('messages').exec((err, messages) => {
			if (err) next(err);
			else res.json(messages);
		});
	},

	sendMessage: function(req, res, next) {
		if (!req.params.name) next(new ServerError('Missing recipient parameter', 'error', 500));
		else if (!req.body.content) next(new ServerError('Missing content parameter', 'error', 500));
		else { 
			let message = new Message(req.body);
			message.sender = req.body.userId;
			Team.findOne({name: req.params.name}, (err, team) => {
				if (err) next(err);
				else if (!team) next(new ServerError('Unknown recipient', 'error', 500));
				else {
					message.save((err, message) => {
						if (err) next(err);
						else {
							team.messages.push(message._id);
							team.save((err) => {
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

	addUser: function(req, res, next) {
		Team.findOne({name:req.params.name}, (err, team) => {
			if (err) next(err);
			else if (!req.body.name) next(new Error('Missing parameter name'));
			else User.findOne({name:req.body.name}, (err, user) => {
				if (err) next(err);
				else if (!user) next(new ServerError('User doesn\'t exist', 'error'));
				else if (team.users.includes(user._id)) {
					res.status(500).json({status: 'error', message: `User ${req.body.name} is already in ${req.params.name} team!`});
				} else {
					team.users.push(user._id);
					team.save(function (err) {
						if (err) next(err);
						else res.json({status: 'success', message: 'User added'});
					});
				}
			});
		});
	}
};