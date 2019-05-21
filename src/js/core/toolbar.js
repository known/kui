//---------------------------toolbar------------------------------------------//
var Toolbar = {

    bind: function (tbId, obj) {
        for (var p in obj) {
            bindButton(tbId, p, obj);
        }

        var top = !tbId.startsWith('tbForm');
        var btnClose = $('#' + tbId + ' #close');
        if (btnClose.length) {
            btnClose.unbind('click').bind('click', function () {
                Dialog.close(top);
            });
        }

        function bindButton(tbId, name, obj) {
            var btn = $('#' + tbId + ' #' + name);
            if (btn.length) {
                btn.unbind('click').bind('click', function () {
                    obj[name].call(obj);
                });
            }
        }
    }

};