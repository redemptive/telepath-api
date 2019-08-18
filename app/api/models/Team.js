const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
	name: { 
		type: String, 
		required: true
	},
	description: {
		type: String,
		trim: true,
	},
	users: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Team', TeamSchema);