//---------------------------url----------------------------------------------//
var Url = {

    getParam: function (name) {
        var url = document.location.href;
        var arrs = url.split('?');
        if (arrs.length <= 1)
            return '';

        var paras = arrs[1].split('&');
        var para;
        for (var i = 0; i < paras.length; i++) {
            para = paras[0].split('=');
            if (para !== null && para[0] === name)
                return para[1];
        }

        return '';
    }

};