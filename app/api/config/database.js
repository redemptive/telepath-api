const dbLocation = process.env.DB_HOST || 'mongodb://localhost/telepath-api'

//Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE });
mongoose.Promise = global.Promise;

mongoose.connection.on('error', function() {
    console.error.bind(console, 'MongoDB connection error:');
    console.log('Retrying in 5 seconds...');

    setTimeout(function() {mongoose.connect(dbLocation, { useNewUrlParser: true, reconnectTries: Number.MAX_VALUE })}, 5000);
});

module.exports = mongoose;