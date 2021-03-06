module.exports = {
	userLoggedIn: function (req, res, next) {
		if (req.session.user_id && req.user && !req.user.locked) {
			next();
		} else if (req.session.user_id && req.user && req.user.locked) {
			if (req.xhr) {
				res.send('<script>window.location="/";</script>');
			} else {
				res.render('account_locked', {user: req.user});
			}
			
		} else {
			res.redirect('/login');
		}
	},
	userAdmin: function (req, res, next) {
		if (req.session.user_id && req.user.admin) {
			next();
		} else {
			res.redirect('/');
		}
	},
}