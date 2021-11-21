function Button(option) {
    //fields
    var _option = option || {},
        _this = this;

    //properties
    this.form = null;

    //methods
    this.render = function (dom) {
        var button = $('<button>').data('item', _option).appendTo(dom);
        _initButton(button);
    }

    //private
    function _initButton(button) {
        if (_option.style)
            button.addClass(_option.style);
        if (_option.icon)
            $('<i>').addClass(_option.icon).appendTo(button);

        $('<span>').html(_option.text).appendTo(button);

        button.on('click', function () {
            var item = $(this).data('item');
            if (item.handler) {
                var e = { item: item, form: _this.form };
                item.handler.call(this, e);
            }
        });
    }
}