define(["jquery", "socketio"], function($, io) {
    $(function($) {
    	var socket = io();
    	var chat_messages = $("#JQ_chat_messages");
    	var chat_message = $("#JQ_chat_message");

		chat_message.on("keypress", function(e) {
			if(e.keyCode === 13) {
				socket.emit("chat message", chat_message.val());
				chat_message.val('');
				return false;
			}
		});    	

		socket.on('chat message', function (msg) {
			chat_messages.append($('<li>').html(msg));
		});
        
    });
});