const dbLocation = process.env.DB_HOST || 'mongodb://localhost/telepath-api'

//Set up mongoose connection
const mongoose = require('mongoose');
mongoose.connect(dbLocation, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;