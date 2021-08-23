function Menu(option) {
    //fields
    var _option = option,
        _elem;

    //properties

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    //private
    function _init() {
        _elem = $('<ul class="menu">');
        if (_option.items) {
            _setData(_option.items);
        }
    }

    function _setData(data) {
        var width = 100 / (_option.lineCount || 2) + '%';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var li = $('<li>').css({ width: width }).appendTo(_elem);
            var inner = $('<div class="inner">').appendTo(li);
            $('<div class="icon">')
                .css({ backgroundColor: d.bgColor })
                .attr('id', d.id)
                .append('<i class="' + d.icon + '">')
                .append('<span class="badge danger">')
                .appendTo(inner)
                .data('item', d)
                .on('click', function () {
                    var item = $(this).data('item');
                    app.router.route(item);
                });
            $('<div class="name">').html(d.name).appendTo(inner);
        }
    }
}