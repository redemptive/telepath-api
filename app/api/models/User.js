const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		trim: true,  
		required: true,
	},
	email: {
		type: String,
		trim: true,
		required: true
	},
	password: {
		type: String,
		trim: true,
		required: true
	},
	userClass: {
		type: String,
		required: true
	},
	messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

// Hash user password before saving into database
UserSchema.pre('save', function(next){
	this.password = bcrypt.hashSync(this.password, saltRounds);
	next();
});

module.exports = mongoose.model('User', UserSchema);