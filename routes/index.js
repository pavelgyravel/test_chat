var express = require('express');
var router = express.Router();
var User = require('../models/user');
var validate = require("validate.js");
var auth = require('../lib/auth');



router.get('/', auth.userLoggedIn, function(req, res, next) {
	User.find({}, function(err, users) {
		res.render('index', {users: users, user: req.user, page: "index"});		
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
		// console.log("err", err);
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
    	name: {
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
		var newUser = new User({
		    email: form.email,
		    username: form.name,
		    password: form.password,
		});

		newUser.findSimilar(form.email, form.name, function (err, users) {
		  if (users.length === 0) {
			newUser.save(function(err, user){
				if (err) {
					res.render('sign_up', {form: form, title: "Sign up to chat.", message: "Something went wrong during registration. Sorry :(", page: "sign_up"});
				}

				req.session.user_id = user.id;
				res.redirect('/');
			});  	
		  } else {
		  	res.render('sign_up', {form: form, title: "Sign up to chat.", message: "User with such name or email already exist.", page: "sign_up"});
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
    	name: {
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
			user.username = form.name;
			if(form.password) {
				user.password = form.password;
			}
			user.save(function(err, user){
				// console.log(user);
				res.render('profile', {title: "User profile", page: "profile", form: user, user: user, message: "Success! Profile saved.", messageType: "alert-success"});		
			});
		})
	}
});

router.get('/user/:user_id', auth.userAdmin, function(req, res) {
	var user_id = req.params.user_id;
	User.findById(user_id, function (err, user) {
		if (user === undefined) {
			res.render('user_profile', {title: "User profile", page: "profile", message: "Looks like this user are not exist", });		
		} else {
			res.render('user_profile', {title: "User profile", page: "profile", user: user});		
		}
		
	});
});;

module.exports = router;