define(["jquery", "jquery.bootstrap.collapse"], function($) {
    $(function($) {
        var $body = $('body')

        //Оперделяем модуль страницы, подключаем его
        var page = $body.data('page')
        if(page){
            requirejs(['pages/'+page]);
        }
    });
});