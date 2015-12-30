
require.config({
    baseUrl: '/js',
    urlArgs: "v=v0.0.1",
    paths: {
        "jquery": "/components/jquery/dist/jquery.min",
        "validate": "/components/validate/validate.min"
    },
    shim: {

    }
});


requirejs(['main']);