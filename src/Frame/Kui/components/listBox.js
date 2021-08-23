function ListBox(elem, option) {
    //field
    var _elem = typeof elem === 'string' ? $('#' + elem) : elem,
        _id = typeof elem === 'string' ? elem : elem.attr('id'),
        _autoLoad = option.autoLoad === undefined ? true : option.autoLoad,
        _option = option || {},
        _body = _elem.find('.list-body'),
        _selectedIndex = 0;
        _this = this;

    //property
    this.id = _id;
    this.selected = null;

    //method
    this.render = function () {
        _elem = $('<div class="list">').attr('id', _id);
        _init();
        return _elem;
    }

    this.select = function (index) {
        _selectedIndex = index;
        _body.find('li:eq(' + index + ')').click();
    }

    this.reload = function () {
        _load();
        this.select(_selectedIndex);
    }

    this.setData = function (data) {
        _setData(data);
    }

    //init
    if (_elem.length) {
        _init();
    }

    //private
    function _init() {
        if (!_body.length) {
            _body = $('<ul class="list-body">').appendTo(_elem);
        }

        if (_option.data) {
            _setData(_option.data);
        } else if (_option.url && _autoLoad) {
            _load();
        }
    }

    function _setData(data) {
        _body.html('');
        _this.selected = null;
        var datas = Utils.getCodes(data);
        var dataName = 'item';
        if (datas && datas.length) {
            for (var i = 0; i < datas.length; i++) {
                var itemData = datas[i];
                var text = itemData.Name || itemData.Code || itemData;
                $('<li class="list-item">')
                    .html(text)
                    .data(dataName, itemData.Data || itemData)
                    .appendTo(_body)
                    .on('click', function () {
                        $('.list-item').removeClass('active');
                        _selectedIndex = $(this).index('li');
                        _this.selected = $(this).addClass('active').data(dataName);
                        if (_option.onClick) {
                            _option.onClick(_this.selected);
                        }
                    });
            }
        }
    }

    function _load() {
        if (!_option.url)
            return;

        $.get(_option.url, function (data) {
            _setData(data);
        });
    }
}