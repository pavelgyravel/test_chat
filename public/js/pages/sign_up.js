define(["jquery", "validate"], function($, validate) {
    $(function($) {
        var login_form = $('#JQ_sign_up_form');
        var username = $('#JQ_username');
        var email = $('#JQ_email');
        var password = $('#JQ_password');
        var confirm_password = $('#JQ_confirm_password');
        var message = $('#JQ_message');

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
        
        login_form.submit(function(e) {
        	message.empty().removeClass('hide');
        	var form_data = {
        		email: email.val(),
        		username: username.val(), 
        		password: password.val(), 
        		confirm_password: confirm_password.val()
        	};
        	var validation = validate(form_data, constraints);

        	if (validation !== undefined) {
        		message.empty().removeClass('hide');
        		for(var index in validation) {     
				    message.append("<p>" + validation[index] + "</p>");
				}
				return false;
        	} else {
				message.addClass('hide');
				return true;
        	}
        	
        });
    });
});