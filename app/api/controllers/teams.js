const Team = require('../models/teams');

module.exports = {
	create: function(req, res, next) {
		let team = new Team(req.body);
		team.save(function (err, result) {
			if (err) next(err);
			else res.json({status: 'success', message: 'Team created'});
		});
	},

	getAll: function(req, res, next) {
		Team.find({}, function(err, teams) {
			if (err) res.send(err);
			else res.json(teams);
		});
	}
};