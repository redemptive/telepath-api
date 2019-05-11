const User = require('../models/users');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');

module.exports = {
	create: function(req, res, next) {
		let user = new User(req.body);
		user.save(function (err, result) {
			if (err) next(err);
			else res.json({status: 'success', message: 'Thanks for registering', data: null});
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
	}
};