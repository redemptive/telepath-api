// Dependancies
const User = require('../models/User');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

// My custom error class with improved functionality
const ServerError = require('../config/ServerError');

module.exports = {
	create: function(req, res, next) {

		const errors = validationResult(req);

		if (errors.isEmpty()) {
			let user = new User(req.body);
			let firstUser = false;
			
			User.findOne({}, (err, user) => {
				// If this is the first user we make them an admin
				if (!user) firstUser = true;
			});
			User.findOne({email:req.body.email}, (err, userInfo) => {
				if (userInfo) next(new Error('User already exists'));
				else if (req.body.password && !req.body.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
					next(new Error('Passwords must contain one number and one special character'));
				} else {
					firstUser ? user.userClass = 'admin' : user.userClass = 'regular';
					user.save((err) => {
						if (err) next(err);
						else res.json({status: 'success', message: 'Thanks for registering', userClass: user.userClass, data: null});
					});
				}
			});
		} else {
			next(new ServerError(errors, 'error', 500));
		}
	},

	makeAdmin: function(req, res, next) {
		if (!req.body.user) next(new ServerError('Please provide user parameter', 'error', 500));
		else {
			User.findOne({name: req.body.user}, (err, user) => {
				if (err) next(err);
				else if (!user) next(new ServerError('Couldnt find that user', 'error', 500));
				else {
					if (user.userClass !== 'admin') {
						user.userClass = 'admin';
						user.save((err) => {
							if (err) next(err);
							else res.json({status: 'success', message: 'Admin created'});
						});
					} else {
						next(new ServerError('User is already an admin', 'error', 500));
					}
				}
			});
		}
	},

	validateAdmin: function(req, res, next) {
		User.findById(req.body.userId, (err, user) => {
			if (user.userClass !== 'admin') {
				next(new ServerError('Insufficient permissions', 'Insufficient permissions', 403));
			} else next();
		});
	},

	authenticate: function(req, res, next) {
		User.findOne({email:req.body.email}, (err, userInfo) => {
			if (err) next(err);
			else if(!userInfo) next(new ServerError('Invalid email/password', 'Unauthorized', 401));
			else {
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
			else if (!user) next(new ServerError('User doesn\'t exist', 'Not found', 404));
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