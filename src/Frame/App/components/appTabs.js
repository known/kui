function Tabs(option) {
    //fields
    var _option = option || {},
        _elem, _header, _content, _router;

    //properties

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    //private
    function _init() {
        _elem = $('<div class="tabs">');
        _header = $('<ul class="tabs-header">').appendTo(_elem);
        _content = $('<div class="tabs-content">').appendTo(_elem);

        if (_option.singleTab) {
            _router = new Router(_content, {});
        }

        if (_option.items) {
            _setData(_option.items);
        }
    }

    function _setData(data) {
        var width = 100 / data.length + '%';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            d.index = i;
            $('<li>').css({ width: width })
                .append(d.name)
                .appendTo(_header)
                .data('item', d)
                .on('click', function () {
                    var item = $(this).data('item');
                    _itemClick($(this), item);
                });
        }
        _itemClick(_header.find('li:eq(0)'), data[0]);
    }

    function _itemClick(elem, item) {
        _header.find('li').removeClass('active');
        elem.addClass('active');
        if (_option.singleTab) {
            _router.route(item);
        } else {
            var index = item.index || 0;
            var id = 'tab-' + index;
            var itemEl = $('#' + id);
            if (!itemEl.length) {
                itemEl = $('<div class="tabs-item">').attr('id', id).appendTo(_content);
                new Router(itemEl, {}).route(item);
            }

            $('.tabs-item', _content).removeClass('active');
            itemEl.addClass('active');
        }
        _option.onItemClick && _option.onItemClick(item);
    }
}