var express = require('express');
var path = require('path');
var hbs = require('hbs');
var fs = require('fs');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var env       = process.env.NODE_ENV || "production";
var config    = require('./config.json')[env];
var mongoose = require('mongoose');
mongoose.connect(config.mongo_url);
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);


var routes = require('./routes/index');
var users = require('./routes/users');

var User = require('./models/user');
var Message = require('./models/message');

var app = express();

var debug = require('debug')('tickets_chat:server');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ios = require('socket.io-express-session');

var store = new MongoDBStore(
{ 
  uri: config.mongo_url,
  collection: 'mySessions'
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var partialsDir = __dirname + '/views/partials';
var filenames = fs.readdirSync(partialsDir);
filenames.forEach(function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  hbs.registerPartial(name, template);
});

hbs.registerHelper("ifCond", function (v1, v2, options){
    if(v1.toString() == v2.toString()) {
        return options.fn(this);
    }
    return options.inverse(this);
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'This is a secret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    resave: true,
    saveUninitialized: true,
    store: store
}));

io.use(ios(session({
    secret: 'This is a secret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    resave: true,
    saveUninitialized: true,
    store: store
})));

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  if (req.session.user_id) {
    User.findOne({_id: req.session.user_id}, function(err, user){
      if (user) req.user = user;
      next();
    })
  } else {
    next();
  }
});

app.use('/', routes);
app.use('/users', users);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


io.on('connection', function(socket) {
  User.findByIdAndUpdate(socket.handshake.session.user_id, { $set: { online: true, socket_id: socket.id}}, function(err, user) {
    io.emit('user list');
    console.log('User ', socket.handshake.session.user_id, ' connected');
  });

  socket.on('disconnect', function(){
    User.findByIdAndUpdate(socket.handshake.session.user_id, { $set: { online: false, socket_id: ""}}, function(err, user){
      io.emit('user list');
      console.log(err, user);
      console.log('User ', socket.handshake.session.user_id, ' disconnected');
    });
  });

  socket.on('chat message', function (user_to_id, msg) {
    User.findById(socket.handshake.session.user_id, function(err, user){
      if(!user.locked) {
        User.findById(user_to_id, function(err, user){
          if (!user.locked) {
            Message.create({from: socket.handshake.session.user_id, to: user_to_id, message:  msg}, function(err, message){      
              socket.broadcast.to(user.socket_id).emit('chat message', socket.handshake.session.user_id, msg);
            });  
          } else {
            io.emit('user locked');
          }
          
        });
      } else {
        io.emit('user locked');
      }
    });
  });

  socket.on('read message', function(user_to_id){
    console.log(user_to_id, socket.handshake.session.user_id);
    Message.update({ from: user_to_id, to: socket.handshake.session.user_id, read: false }, { $set: { read: true }}, function(err, message){
      console.log(err, message);
    });
  });

});


var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

http.listen(port, function(){
  console.log('listening on http://localhost:'+ port);
});

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

