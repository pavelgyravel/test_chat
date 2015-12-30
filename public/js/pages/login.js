define(["jquery", "validate"], function($, validate) {
    $(function($) {
        var login_form = $('#JQ_login_form');
        var name = $('#JQ_name');
        var password = $('#JQ_password');
        var message = $('#JQ_message');

        console.log(message);

        var constraints = {
        	email: {
        		presence: true,
                email: true
        	},
        	password: {
        		presence: true,	
        	}
        };
        
        login_form.submit(function(e) {
        	var validation = validate({name: email.val(), password: password.val()}, constraints);

        	if (validation !== undefined) {
        		console.log(validation);
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