const express = require('express');
const logger = require('morgan');
const auth = require('./routes/auth');
const users = require('./routes/users');
const posts = require('./routes/posts');
const teams = require('./routes/teams');
const messages = require('./routes/messages');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

const ServerError = require('./config/serverError');

const port = process.env.NODE_PORT || 3000;

// jwt secret token
app.set('secretKey', 'nodeRestApi');

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// public routes
app.use('/api/', auth);

// private routes
app.use('/api/posts', validateUser, posts);
app.use('/api/users', validateUser, users);
app.use('/api/teams', validateUser, teams);
app.use('/api/messages', validateUser, messages);

// Nice wee welcome message
app.get('/api', function(req, res){
	res.json({'message' : 'Hello'});
});

app.get('/favicon.ico', function(req, res) {
	res.sendStatus(204);
});

function validateUser(req, res, next) {
	jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
		if (err) {
			next(new ServerError(err.message, 'error', 403));
		} else {
			// add user id to request
			req.body.userId = decoded.id;
			next();
		}
	});
  
}

// handle 404 error
app.use(function(req, res, next) {
	next(new ServerError('Couldn\'t find that page', 'Not found', 404));
});

// handle other errors
app.use(function(err, req, res, next) {
	if (err.status) res.status(err.statusCode).json({status: `${err.status}`, message: `${err.message}`});
	else res.status(500).json({status:'error', message: `${err.message}`});
});

app.listen(port, function(){
	console.log(`Telepath api server listening on port ${port}`);
});

module.exports = app;