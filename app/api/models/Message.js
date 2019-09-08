const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	sender: { 
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