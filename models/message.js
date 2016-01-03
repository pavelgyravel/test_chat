var mongoose = require('mongoose');
 
var MessageSchema = mongoose.Schema({
    from: { type: String, required: true},
    to: { type: String, required: true},
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
});

MessageSchema.pre('save', function(next) {
    var message = this;

    //console.log("From model ", message);

    next();
    // if (!user.isModified('password')) return next();

    // bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    //     if (err) return next(err);

        
    //     bcrypt.hash(user.password, salt, function(err, hash) {
    //         if (err) return next(err);

    //         user.password = hash;
    //         next();
    //     });
    // });
});

MessageSchema.methods.markAsRead = function () {   
  //console.log(this);
}

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
