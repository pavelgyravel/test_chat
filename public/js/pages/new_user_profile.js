define(["jquery", "validate"], function($, validate) {
    $(function($) {
        var login_form = $('#JQ_profile_form');
        var email = $('#JQ_email');
        var username = $('#JQ_username');
        var password = $('#JQ_password');
        var confirm_password = $('#JQ_confirm_password');
        var lock_user = $('#JQ_lock_user');
        var admin = $('#JQ_admin');
        var message = $('#JQ_message');
        var user_id = $('#JQ_user_id');


        
        login_form.submit(function(e) {

        	
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

        	message.empty().removeClass('hide alert-success').addClass('alert-danger');
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