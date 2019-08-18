const Team = require('../models/Team');
const User = require('../models/User');
const ServerError = require('../config/ServerError');

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
		}).exec((err, teams) => {
			if (err) res.send(err);
			else res.json(teams);
		});
	},

	getByName: function(req, res, next) {
		Team.findOne({name:req.params.name}).populate({
			path: 'users',
			select: 'name'
		}).exec((err, team) => {
			if (err) res.send(err);
			else if (!team) next(new ServerError('Team doesn\'t exist', 'Not found', 404));
			else res.json(team);
		});
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