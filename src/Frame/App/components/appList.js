function List(option) {
    //fields
    var _option = option,
        _elem,
        _template = option.template || function (e) {
            e.el.append('<span class="icon"><i class="' + e.data.icon + '"></i></span>')
                .append('<span class="title">' + e.data.title + '</span>');
            if (e.data.onClick) {
                e.el.append('<span class="right fa fa-chevron-right">');
            }
        };

    //properties

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    this.loading = function () {
        _loading();
    }

    this.load = function (url, callback) {
        _load(url, callback);
    }

    this.setData = function (data) {
        _setData(data);
    }

    //pricate
    function _init() {
        _elem = $('<ul class="list">');

        if (_option.style)
            _elem.addClass(_option.style);

        if (_option.items) {
            var items = _option.items;
            if ($.isFunction(_option.items))
                items = _option.items();
            _setData(items);
        }
    }

    function _loading() {
        _elem.html('<li class="load">' + Language.Loading + '......</li>');
    }

    function _load(url, callback) {
        _loading();
        $.post(url, function (data) {
            if ($.isArray(data))
                _setData(data);
            callback && callback(data);
        });
    }

    function _setData(data) {
        _elem.html('');
        if (data && data.length) {
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                var li = $('<li>').data('item', d).appendTo(_elem);
                _template({ el: li, data: d });
                if (d.onClick) {
                    li.on('click', function () {
                        var item = $(this).data('item');
                        item.onClick();
                    });
                } else if (_option.onClick) {
                    li.on('click', function () {
                        var item = $(this).data('item');
                        _option.onClick(item);
                    });
                }
            }
        } else {
            _elem.html('<li class="error">' + Language.NoData + '</li>');
        }
    }
}