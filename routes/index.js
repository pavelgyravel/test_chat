var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Messages = require('../models/message');
var validate = require("validate.js");
var auth = require('../lib/auth');
var _ = require('lodash');


router.get('/', auth.userLoggedIn, function(req, res, next) {
	User.find({ _id: { '$ne': req.user._id}}, {}, { sort: { online: -1 }}, function(err, users) {
		
		Messages.find({ to: req.user._id, read: false}, function(err, messages){
			var unread_messages = _.countBy(messages, function(message) {
				return message.from;
			});
			res.render('index', {unread_messages: unread_messages, users: users, user: req.user, page: "index"});			
		})
		
	})
});

router.get('/user_list', auth.userLoggedIn, function(req, res, next) {
	User.find({ _id: { '$ne': req.user._id}}, {}, { sort: { online: -1 }}, function(err, users) {
		
		Messages.find({ to: req.user._id, read: false}, function(err, messages){
			var unread_messages = _.countBy(messages, function(message) {
				return message.from;
			});
			res.render('users_list', {unread_messages: unread_messages, users: users, user: req.user, layout: false});			
		})
		
	})
});

router.get('/login', function(req, res, next) {
	res.render('login', {page: "login"});
});

router.post('/login', function(req, res, next) {
	var form = req.body;

	var constraints = {
    	email: {
    		presence: true,
    	},
    	password: {
    		presence: true,	
    	}
    };

    var validation = validate(form, constraints);

    if (validation !== undefined) {
		var message = "";
		for(var index in validation) {     
		    message += "<p>" + validation[index] + "</p>";
		}
		res.render('login', {form: form, title: "Login up to chat.", message: message, page: "login"});
	} else {
		User.findOne({email: form.email}, function(err, user) {
			if (err || !user) {
				res.render('login', {form: form, title: "Login to chat.", message: "Wrong email or password.", page: "login"});
			} else {	
				
				user.comparePassword(form.password, function(err, isMatch) {
		            if (err) {
		            	res.render('login', {form: form, title: "Login to chat.", message: "Something went wrong during login. Sorry :(", page: "login"});
		            }

		            if (isMatch) {
		            	req.session.user_id = user.id;
						res.redirect('/');
		            } else {
		            	res.render('login', {form: form, title: "Login to chat.", message: "Wrong email or password.", page: "login"});
		            }
		            
		        });

			}
		});
		
	}	
});

router.get('/logout', function(req, res, next) {
	
	req.session.destroy(function(err){	
		res.redirect('/');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
	}); 
});

router.get('/sign_up', function(req, res, next) {
  res.render('sign_up', {page: "sign_up", title: "Sign up to chat."});
});

router.post('/sign_up', function(req, res, next) {
	var form = req.body;

	var constraints = {
    	email: {
    		presence: true,	
    		email: true
    	},
    	username: {
    		presence: true,
    	},
    	password: {
    		presence: true,	
    	},
    	confirm_password: {
    		presence: true,	
			equality: "password"
		}
    };

    var validation = validate(form, constraints);

    if (validation !== undefined) {
		var message = "";
		for(var index in validation) {     
		    message += "<p>" + validation[index] + "</p>";
		}
		res.render('sign_up', {form: form, title: "Sign up to chat.", message: message, page: "sign_up"});
	} else {
		var user = new User;
		user.createUser(form, function (err, user) {
			if (err) {
				res.render('sign_up', {form: form, title: "Sign up to chat.", message: err.msg, page: "sign_up"});
			} else {
				req.session.user_id = user.id;
		 		res.redirect('/');
			}
		});
	}
});

router.get('/restore', function(req, res, next) {
  res.render('restore', {page: "restore"});
});

router.get('/users_list', auth.userLoggedIn, function(req, res, next) {
	User.find({}, function(err, users) {
		res.render('users_list', {users: users, user: req.user});		
	})
  
});

router.get('/profile', auth.userLoggedIn, function(req, res, next) {
	res.render('profile', {title: "User profile", page: "profile", form: req.user, user: req.user});
});

router.post('/profile', auth.userLoggedIn, function(req, res, next) {
	var form = req.body;

	var constraints = {
    	username: {
    		presence: true,
    	},
    };

    if (form.password || form.confirm_password) {
    	constraints.password = {
    		presence: true,	
    	};
    	constraints.confirm_password = {
    		presence: true,	
			equality: "password"
		};
    }

    var validation = validate(form, constraints);

    if (validation !== undefined) {
		var message = "";
		for(var index in validation) {     
		    message += "<p>" + validation[index] + "</p>";
		}
		res.render('profile', {form: form, title: "User profile", message: message, page: "profile", user: req.user});
	} else {
		User.findById(req.user._id, function(err, user) {
			user.username = form.username;
			if(form.password) {
				user.password = form.password;
			}
			user.save(function(err, user){
				
				res.render('profile', {title: "User profile", page: "profile", form: user, user: user, message: "Success! Profile saved.", messageType: "alert-success"});		
			});
		})
	}
});

router.get('/user', auth.userAdmin, function(req, res) {
	res.render('new_user_profile', {title: "New user", page: "user_profile"});
});


router.post('/user', auth.userAdmin, function(req, res) {
	var form = req.body;

	var constraints = {
    	username: {
    		presence: true,
    	},
        email: {
            presence: true,
            email: true
        },
        password: {
    		presence: true,	
    	},
    	confirm_password: {
    		presence: true,	
			equality: "password"
		}
    };

    var validation = validate(form, constraints);

    if (validation !== undefined) {
		var message = "";
		for(var index in validation) {     
		    message += "<p>" + validation[index] + "</p>";
		}
		res.render('new_user_profile', {form: form, title: "New user", message: message, page: "new_user_profile", user: form});
	} else {
		var user = new User;
		user.createUser(form, function(err, user){
			if (err) {
				res.render('new_user_profile', {form: form, title: "New user", message: err.msg, page: "new_user_profile", user: form});	
			} else {
				res.render('user_profile', {title: "User profile", page: "profile", form: user, user: user, message: "Success! Profile saved.", messageType: "alert-success"});
			}
		});
		
	}


	
});

router.get('/user/:user_id', auth.userAdmin, function(req, res) {
	var user_id = req.params.user_id;
	User.findById(user_id, function (err, user) {
		if (user === undefined) {
			res.render('user_profile', {title: "User profile", page: "user_profile", message: "Looks like this user are not exist", });		
		} else {
			res.render('user_profile', {title: "User profile", page: "user_profile", user: user});		
		}
	});
});

router.post('/user/:user_id', auth.userAdmin, function(req, res) {
	var form = req.body;
	var user_id = req.params.user_id;

	var constraints = {
    	username: {
    		presence: true,
    	},
    };

    if (form.password || form.confirm_password) {
    	constraints.password = {
    		presence: true,	
    	};
    	constraints.confirm_password = {
    		presence: true,	
			equality: "password"
		};
    }
    var validation = validate(form, constraints);

    if (validation !== undefined) {
		var message = "";
		for(var index in validation) {     
		    message += "<p>" + validation[index] + "</p>";
		}
		User.findById(user_id, function (err, user) {
			res.render('user_profile', {user: user, title: "User profile", message: message, page: "user_profile"});	
		});
		
	} else {
		if (!form.admin) form.admin = false;
		if (!form.locked) form.locked = false;
		var user = new User;
		user.updateUser(form, function(err, user){
			res.render('user_profile', {title: "User profile", page: "user_profile", user: user, message: "Success! Profile saved.", messageType: "alert-success"});
		});
	}
});

router.get('/delete/:user_id', auth.userAdmin, function(req, res) {
	
	var user_id = req.params.user_id;
	var user = new User;
	user.deleteUser(user_id, function (err, user) {
		res.redirect('/');
	});
});

router.get('/messages/:user_id', auth.userLoggedIn, function(req, res){
	var user_to_id = req.params.user_id;
	var user_from_id = req.session.user_id;
	User.findById(user_to_id, function(err, other_user){
		Messages.find( { $or:[ {from: user_from_id, to: user_to_id}, {from: user_to_id, to: user_from_id} ]},{}, { sort: { timestamp: 1 }}, function(err, messages) {

			for (var i in messages) {
				messages[i].read = true;
				messages[i].save();
			}
			
		    if(!err) {
		   		res.render('messages', {messages: messages, layout: false, user: req.user, other_user: other_user});
		    } else {
		    	res.send([]);
		    }
		 
			
		    
		});    
	});
	
});

module.exports = router;