// Dependandies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// A custom error class for error responses
const ServerError = require('./config/ServerError');

// Secret for JWT token generation
const jwtSecret = process.env.NODE_JWT_SECRET || 'pleaseDontUseForProduction';

// Routes import
const auth = require('./routes/auth');
const users = require('./routes/users');
const posts = require('./routes/posts');
const teams = require('./routes/teams');
const messages = require('./routes/messages');

const port = process.env.NODE_PORT || 3000;

// jwt secret token
app.set('secretKey', jwtSecret);

// I need cross origin requests to allow the react frontend to work
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

// This is an API! Return 204 content for favicon
app.get('/favicon.ico', function(req, res) {
	res.sendStatus(204);
});

function validateUser(req, res, next) {
	jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function(err, decoded) {
		if (err) next(new ServerError(err.message, 'error', 403));
		else {
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

// Last middleware, catch any remaining errors
app.use(function(err, req, res, next) {
	if (err.status) res.status(err.statusCode).json({status: `${err.status}`, message: `${err.message}`});
	else res.status(500).json({status:'error', message: `${err.message}`});
});

app.listen(port, () => {
	console.log(`Telepath api server listening on port ${port}`);
	if (jwtSecret === 'pleaseDontUseForProduction') {
		console.log('WARNING: You are using the default jwt secret. Please set environment variable JWT_SECRET for a secure api');
	}
});

module.exports = app;