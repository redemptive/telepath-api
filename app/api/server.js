const express = require('express');
//const logger = require('morgan');
const users = require('./routes/users');
const posts = require('./routes/posts');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const jwt = require('jsonwebtoken');
const app = express();

// jwt secret token
app.set('secretKey', 'nodeRestApi');

//app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// public routes
app.use('/users', users);

// private routes
app.use('/posts', validateUser, posts);

app.get('/', function(req, res){
	res.json({'message' : 'Hello'});
});

app.get('/favicon.ico', function(req, res) {
	res.sendStatus(204);
});

function validateUser(req, res, next) {
	jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
		if (err) {
			res.status(500).json({status:'error', message: err.message, data:null});
		} else {
			// add user id to request
			req.body.userId = decoded.id;
			next();
		}
	});
  
}

// handle 404 error
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// handle other errors
app.use(function(err, req, res, next) {
	//console.log(err);
 
	if (err.status === 404) res.status(404).json({message: 'Not found'});
	else res.status(500).json({message: 'Something went wrong...'});
});

app.listen(3000, function(){
	console.log('Telepath api server listening on port 3000');
});

module.exports = app;