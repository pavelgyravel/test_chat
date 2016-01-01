define(["jquery", "validate"], function($, validate) {
    $(function($) {
        var login_form = $('#JQ_profile_form');
        var username = $('#JQ_username');
        var password = $('#JQ_password');
        var confirm_password = $('#JQ_confirm_password');
        var lock_user = $('#JQ_lock_user');
        var admin = $('#JQ_admin');
        var delete_user = $('#JQ_delete_user');
        var message = $('#JQ_message');
        var user_id = $('#JQ_user_id');


        
        login_form.submit(function(e) {

        	var constraints = {
		    	username: {
		    		presence: true,
		    	},
		    };

		    if (password.val() || confirm_password.val()) {
		    	constraints.password = {
		    		presence: true,	
		    	};
		    	constraints.confirm_password = {
		    		presence: true,	
					equality: "password"
				};
		    }

        	message.empty().removeClass('hide alert-success').addClass('alert-danger');
        	var form_data = {
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

        delete_user.on('click', function(e) {
            e.preventDefault();
            if (confirm("Delete user?")) {
                window.location = '/delete/' + user_id.val();
            }
        });
    });
});