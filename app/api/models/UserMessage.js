const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserMessageSchema = new Schema({
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

module.exports = mongoose.model('UserMessage', UserMessageSchema);