var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
 
var UserSchema = mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    admin: { type: Boolean, default: false },
    locked: { type: Boolean, default: false },
});

UserSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.methods.findSimilar = function (email, name, cb) {	
  return this.model('User').find({$or: [{username: name}, {email: email}, ]}, cb);
}

UserSchema.methods.createUser = function(user, cb) {

    this.model('User').create(user, function(err, user) {
        if (err){  
            console.log(err);
            err.msg = (err.code === 11000) ? "User with such name or email already exist" : "Something went wrong during registration. Sorry :(";
            cb(err);
        } else {
            cb(err, user);
        }
    });  
};

UserSchema.methods.updateUser = function(user, cb) {
    var self = this;    

    self.model('User').findById(user._id, function(err, old_user){
        
        old_user.username = user.username;
        old_user.admin = user.admin;
        old_user.locked = user.locked;
        if (user.password) old_user.password = user.password;
        old_user.save(function(err, user){
            if (err) {
                err.msr = "Something went wrong during updating user. Sorry :(";
                cb(err);
            } else {
                cb(err, user);    
            } 
        }); 
    });
};

UserSchema.methods.deleteUser = function(user_id, cb) {
    this.model('User').findByIdAndRemove(user_id, cb);
};

var User = mongoose.model('User', UserSchema);

module.exports = User;
