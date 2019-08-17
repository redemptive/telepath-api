const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	sender: { 
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	recipient: { 
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true
	},
	content: {
		type: String,
		trim: true,
		required: true
	}
});

module.exports = mongoose.model('Message', MessageSchema);