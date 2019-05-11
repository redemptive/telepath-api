const dbLocation = process.env.DB_HOST || 'mongodb://localhost/telepath-api';
const dbRetries = process.env.DB_RETRIES || 5;

//Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: dbRetries });
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function() {
	console.error.bind(console, 'MongoDB connection error:');
	console.log('Retrying in 5 seconds...');

	setTimeout(function() {mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: dbRetries });}, 5000);
});

module.exports = mongoose;