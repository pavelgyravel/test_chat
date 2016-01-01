module.exports = {
	userLoggedIn: function (req, res, next) {
		if (req.session.user_id && req.user) {
			next();
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