function Card(option) {
    //fields
    var _option = option || {},
        _elem, _header, _content;

    //properties
    this.option = _option;

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    //private
    function _init() {
        _elem = $('<div class="card">');
        _header = $('<div class="card-header">').appendTo(_elem);
        if (_option.icon)
            $('<span>').addClass(_option.icon).appendTo(_header);
        if (_option.title)
            $('<span>').html(_option.title).appendTo(_header);
        if (_option.tool)
            $('<span class="tool">').html(_option.tool).appendTo(_header);

        _content = $('<div class="card-body">').appendTo(_elem);

        if (_option.style)
            _elem.css(_option.style);

        if (_option.body)
            _content.html(_option.body);

        _option.callback && _option.callback({ header: _header, body: _content });
    }
}

function IconCard(option) {
    //fields
    var _option = option || {},
        _elem, _value;

    //properties
    this.option = _option;

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    this.setValue = function (value) {
        _value.html(value);
    }

    //private
    function _init() {
        _elem = $('<div class="small-box">').attr('id', _option.id).css('width', _option.width);
        var inner = $('<div class="inner">').appendTo(_elem);
        var value = _option.value;
        _value = $('<h3>').html(_option.value || '0').appendTo(inner);
        $('<p>').html(_option.name).appendTo(inner);
        var icon = $('<div class="icon">').appendTo(inner);
        $('<i>').addClass(_option.icon).appendTo(icon);

        if (_option.style) {
            inner.css(_option.style);
        }
    }
}