var BizPreview = {
    tiff: function (elem, url) {
        if (typeof Tiff === 'undefined') {
            Utils.addJs(baseUrl + '/static/libs/tiff.min.js');
        }

        elem.html(Language.Loading + '......');
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', url);
        xhr.onload = function (e) {
            var tiff = new Tiff({ buffer: xhr.response });
            var canvas = tiff.toCanvas();
            elem.html('').append(canvas);
        }
        xhr.send();
    }
}