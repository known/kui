function Tabs(option) {
    //fields
    var _option = option || {},
        _elem,
        _header, _title, _tab,
        _content, _router,
        _this = this, _opened;

    //properties
    this.option = _option;

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    this.show = function (data) {
        _opened = true;
        data = data || { Id: '' };

        if (_option.showTitle) {
            var title = _option.title;
            if (!title) {
                var tab = getCurTab();
                title = tab ? tab.title : '';
            }

            _title.html('');
            var icon = option.icon || 'fa fa-window-maximize';
            _title.append('<i class="' + icon + '">').append(title);

            var actionName = data.Id === '' ? '【' + Language.New + '】' : '【' + Language.Edit + '】';
            var titleInfo = '';
            if (_option.titleInfo) {
                titleInfo = _option.titleInfo(data);
            }
            if (titleInfo.indexOf('【') > -1) {
                actionName = '';
            }
            _title.append(actionName + titleInfo);
        }

        _elem.show();
    }

    this.close = function () {
        if (_opened) {
            _elem.hide();
        }
    }

    //private
    function _init() {
        _elem = $('<div class="tabs">');
        _header = $('<div class="tabs-header">').appendTo(_elem);
        if (_option.showTitle)
            _title = $('<div class="tabs-title">').appendTo(_header);
        _tab = $('<ul>').appendTo(_header);
        if (_option.showClose) {
            $('<i class="fa fa-close close">')
                .appendTo(_header)
                .click(function () {
                    _elem.hide();
                    _option.onClose && _option.onClose();
                });
        }
        _content = $('<div class="tabs-body">').appendTo(_elem);

        if (_option.fit)
            _elem.addClass('tabs-fit');

        if (_option.style)
            _elem.addClass(_option.style);

        if (_option.singleTab)
            _router = new Router(_content, {});

        if (_option.items)
            _setData(_option.items);
    }

    function _setData(data) {
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            d.index = i;
            var li = $('<li>')
                .append(d.name)
                .appendTo(_tab)
                .data('item', d)
                .on('click', function () {
                    var item = $(this).data('item');
                    _itemClick($(this), item);
                });
        }
        _itemClick(_tab.find('li:eq(0)'), data[0]);
    }

    function _itemClick(elem, item) {
        _tab.find('li').removeClass('active');
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