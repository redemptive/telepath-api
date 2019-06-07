const User = require('../models/users');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

module.exports = {
	create: function(req, res, next) {
		let user = new User(req.body);
		User.findOne({email:req.body.email}, function(err, userInfo){
			if (userInfo) {
				res.status(500).json({status:'error', message: 'User already exists', data:null});
			} else if (req.body.password && !req.body.password.match(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/)) {
				res.status(500).json({status:'error', message: 'Passwords must contain one number and one special character', data:null});
			} else {
				user.save(function (err) {
					if (err) next(err);
					else res.json({status: 'success', message: 'Thanks for registering', data: null});
				});
			}
		});
	},

	authenticate: function(req, res, next) {
		User.findOne({email:req.body.email}, function(err, userInfo){
			if (err) {
				next(err);
			} else if(!userInfo) {
				res.status(500).json({status: 'error', message: 'Invalid email/password!!!'});
			} else {
				if(bcrypt.compareSync(req.body.password, userInfo.password)) {
					const token = jwt.sign({id: userInfo._id}, req.app.get('secretKey'), { expiresIn: '1h' });
					res.json({status:'success', message: 'Logged in successfully', data:{user: userInfo, token:token}});
				} else {
					res.json({status:'error', message: 'Invalid email/password!!!', data:null});
				}
			}
		});
	},

	getByName: function(req, res, next) {
		User.findOne({name:req.params.name}).select(['-password', '-email']).then(function(err, user) {
			if (err) res.send(err);
			else if (!user) next(new Error('User doesn\'t exist'));
			else res.json(user);
		});
	},

	getAll: function(req, res, next) {
		User.find({}).select(['-password', '-email']).then(function(err, users) {
			if (err) res.send(err);
			else res.json(users);
		});
	}
};