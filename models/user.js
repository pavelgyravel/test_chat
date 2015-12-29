var mongoose = require('mongoose');
 
var userSchema = mongoose.Schema({
    name: {
    	unique : true, 
    	required : true,
    	type: String
    },
    password: String,
    admin: Boolean
});

var User = mongoose.model('User', userSchema);

module.exports = User;
