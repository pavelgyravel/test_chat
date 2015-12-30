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

var app = express();
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  if (req.session.user_id) {
    User.findOne({_id: req.session.user_id}, function(err, user){
      req.user = user;
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


module.exports = app;
