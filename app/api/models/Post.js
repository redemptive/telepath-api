const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const PostSchema = new Schema({
	userId: { 
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

module.exports = mongoose.model('Post', PostSchema);