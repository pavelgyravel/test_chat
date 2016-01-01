
require.config({
    baseUrl: '/js',
    urlArgs: "v=v0.0.1",
    paths: {
        jquery: "/components/jquery/dist/jquery.min",
        validate: "/components/validate/validate.min",
        socketio: "/socket.io/socket.io",
        "jquery.bootstrap.collapse": "/components/bootstrap/js/collapse",
    },
    shim: {
    	'socketio': {
    		exports: 'io'
    	},
    	"jquery.bootstrap.collapse": {
            deps: ["jquery"]
        },

    }
});


requirejs(['main']);