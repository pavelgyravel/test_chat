define(["jquery", "socketio"], function($, io) {
    $(function($) {
    	var socket = io();
    	var chat_messages = $("#JQ_chat_messages");
    	var chat_message = $("#JQ_chat_message");
    	var user_link = $('.JQ_chat_user_link');
    	var users_list = $('#JQ_users_list');

    	var current_user_link;
    	var user_to_id;

    	user_link.on('click', user_link_click);

		chat_message.on("keypress", function(e) {
			var message = chat_message.val();
			if(e.keyCode === 13 && message !== "") {
				socket.emit("chat message", user_to_id, message);
				chat_messages.append($('<li>').html("<b>Me:</b> " + message));
				chat_message.val('');
				scrollMessages();
				return false;
			}
		});    	

		socket.on('chat message', function (id, msg) {
			console.log(current_user_link.text());
			if (user_to_id === id) {
				chat_messages.append($('<li>').html("<b>" + current_user_link.text().trim() + ":</b> " + msg));
				scrollMessages();
				markMessagesAsRead();
			} else {
				load_new_user_list();
			}
		});

		socket.on('user list', function (flag) {
			load_new_user_list();
			console.log('connected 2 ', flag);
		});

		socket.on('user locked', function (data) {
			load_new_user_list();
			window.location = '/';
			alert('User was locked by admin.');
		});

		function load_new_user_list() {
			$.ajax({
    			url: '/user_list/',
    			method: 'get',
    			success: function(result) {
    				users_list.html(result);
    				user_link = $('.JQ_chat_user_link');
    				user_link.on('click', user_link_click);
    				current_user_link = $('#' + user_to_id);
    				current_user_link.addClass('current_chat_user');
    			}
    		});
		}

		function user_link_click(e) {
    		e.preventDefault();
    		current_user_link = $(this);
    		user_to_id = current_user_link.data('user-id');

    		user_link.removeClass('current_chat_user');
    		current_user_link.addClass('current_chat_user');
    		chat_messages.empty();
    		chat_message.prop('disabled', false);

    		$.ajax({
    			url: '/messages/' + user_to_id,
    			method: 'get',
    			success: function(result) {
    				chat_messages.html(result);
    				load_new_user_list();
    				scrollMessages();
    			}
    		});
    	}

    	function scrollMessages () {
    		chat_messages.scrollTop(chat_messages.prop('scrollHeight'));
    	}

    	function markMessagesAsRead () {
    		socket.emit("read message", user_to_id);
    	}
    });
});