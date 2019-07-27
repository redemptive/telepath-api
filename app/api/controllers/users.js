const User = require('../models/users');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const ServerError = require('../config/serverError');

module.exports = {
	create: function(req, res, next) {
		let user = new User(req.body);
		User.findOne({email:req.body.email}, (err, userInfo) => {
			if (userInfo) {
				next(new Error('User already exists'));
			} else if (req.body.password && !req.body.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
				next(new Error('Passwords must contain one number and one special character'));
			} else {
				user.save((err) => {
					if (err) next(err);
					else res.json({status: 'success', message: 'Thanks for registering', data: null});
				});
			}
		});
	},

	authenticate: function(req, res, next) {
		User.findOne({email:req.body.email}, (err, userInfo) => {
			if (err) {
				next(err);
			} else if(!userInfo) {
				next(new ServerError('Invalid email/password', 'Unauthorized', 401));
			} else {
				if (bcrypt.compareSync(req.body.password, userInfo.password)) {
					const token = jwt.sign({id: userInfo._id}, req.app.get('secretKey'), { expiresIn: '1h' });
					res.json({status:'success', message: 'Logged in successfully', data:{user: userInfo, token:token}});
				} else {
					next(new ServerError('Invalid email/password', 'Unauthorized', 401));
				}
			}
		});
	},

	getByName: function(req, res, next) {
		User.findOne({name:req.params.name}).select(['-password', '-email']).then((err, user) => {
			if (err) res.send(err);
			else if (!user) next(new Error('User doesn\'t exist'));
			else res.json(user);
		});
	},

	getAll: function(req, res, next) {
		User.find({}).select(['-password', '-email']).then((err, users) => {
			if (err) res.send(err);
			else res.json(users);
		});
	}
};