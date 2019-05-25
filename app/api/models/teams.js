const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
	name: { 
		type: String, 
		required: true
	},
	description: {
		type: String,
		trim: true,
	}
});

module.exports = mongoose.model('Team', TeamSchema);