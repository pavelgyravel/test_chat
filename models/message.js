var mongoose = require('mongoose');
 
var MessageSchema = mongoose.Schema({
    from: { type: String, required: true},
    to: { type: String, required: true},
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
