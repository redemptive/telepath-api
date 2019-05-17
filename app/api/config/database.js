const dbLocation = process.env.DB_HOST || 'mongodb://localhost/telepath-api';
let dbRetries = process.env.DB_RETRIES || 5;

//Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: dbRetries });
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function() {
	if (dbRetries > 0) {
		console.error.bind(console, `Couldn't connect to mongoDB database at ${dbLocation}`);
		console.log(`Retrying ${dbRetries} more times in 5 seconds...`);

		dbRetries--;
		setTimeout(function() {mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: 10 });}, 5000);
	} else {
		console.log(`Couldn't connect to mongoDB database at ${dbLocation} within the specified number of tries`);
		console.log(`Will now exit...`);
		process.exit(1);
	}
});

module.exports = mongoose;