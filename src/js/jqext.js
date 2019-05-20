//---------------------------jquery-------------------------------------------//
var cachedPages = [];

$.fn.extend({

    loadHtml: function () {
        var url = arguments[0],
            param = null,
            callback = null;

        if (arguments.length > 2) {
            param = arguments[1];
            callback = arguments[2];
        } else if (arguments.length > 1) {
            if (typeof arguments[1] === 'function') {
                callback = arguments[1];
            } else {
                param = arguments[1];
            }
        }

        var _this = $(this), pageUrl = url + JSON.stringify(param);
        var page = cachedPages.find(p => p.url === pageUrl);

        if (!page) {
            _this.html('加载中....');
            if (url.indexOf('.html') === -1) {
                url = url + '.html';
            }
            Ajax.getText('/Pages' + url, param, function (result) {
                if (!$.isPlainObject(result)) {
                    cachedPages.push({ url: pageUrl, html: result });
                    _this.html(result);
                    callback && callback();
                }
            });
        } else {
            _this.html(page.html);
            callback && callback();
        }
    },

    loadView: function (url, callback) {
        var arr = url.split('/');
        var view = arr[arr.length - 1].split('.')[0];
        $(this).loadHtml(url, function () {
            mini.parse();
            if (callback) {
                callback();
            } else {
                eval(view + '.show();');
            }
        });
    }

});