function Grid(option) {
    //fields
    var _option = option,
        _elem = $('<div class="grid">'),
        _columns = [],
        _columnLength = 0,
        _query, _thead, _tbody,
        _data = [],
        _this = this;

    //properties
    this.elem = _elem;
    this.columns = _columns;
    this.where = _option.where || {};

    //methods
    this.render = function () {
        _elem.html('');
        _init();
        return _elem;
    }

    this.setColumns = function (columns) {
        _setColumns(columns);
    }

    this.getData = function () {
        return _data;
    }

    this.setData = function (data) {
        _setData(data);
    }

    this.reload = function (where) {
        var query = _query ? _query.getData() : {};
        $.extend(_this.where, query, where || {});
        _queryData();
    }

    //pricate
    function _init() {
        if (_option.querys && _option.querys.length) {
            _query = _createQuery(_option);
        }

        var table = $('<table>').appendTo(_elem);
        _thead = $('<thead>').appendTo(table);

        if (_option.columns && _option.columns.length) {
            _setColumns(_option.columns);
        }

        _tbody = $('<tbody>').appendTo(table);

        if (_option.url && _option.autoQuery === undefined) {
            _queryData();
        }
    }

    function _queryData() {
        _setBodyMessage(Language.Loading + '......', 'load');
        $.get(_option.url, _this.where, function (res) {
            var data = [];
            if ($.isArray(res)) {
                data = res;
            } else {
                if (!res.ok) {
                    _setBodyMessage(res.message, 'error');
                } else {
                    data = res.data;
                }
            }

            if (_option.setData) {
                _data = data;
                _option.setData({ grid: _this, data });
            } else {
                _this.setData(data);
            }
        });
    }

    function _createQuery(option) {
        var queryEl = $('<div class="query">').appendTo(_elem);
        var query = new Query(option);
        query.render().appendTo(queryEl);
        return query;
    }

    function _setColumns(columns) {
        _thead.html('');
        var tr = $('<tr>').appendTo(_thead);
        _columns = columns;
        _columnLength = columns.length;
        for (var i = 0; i < columns.length; i++) {
            var d = columns[i];
            if (d.visible !== undefined && !d.visible)
                continue;

            $('<th>')
                .html(d.title)
                .appendTo(tr);
        }
    }

    function _setData(data) {
        _data = data;
        _tbody.html('');
        if (data && data.length) {
            for (var i = 0; i < data.length; i++) {
                _setDataRow(data[i]);
            }
        } else {
            _setBodyMessage(Language.NoDataFound, 'error');
        }
    }

    function _setDataRow(row) {
        var tr = $('<tr>').appendTo(_tbody);
        for (var i = 0; i < _columns.length; i++) {
            var column = _columns[i];
            if (column.visible !== undefined && !column.visible)
                continue;

            var td = $('<td>').appendTo(tr);
            if (column.format) {
                var tdc = column.format(row, { tr, td, column });
                td.append(tdc);
            } else if (column.field) {
                var text = row[column.field];
                td.append(text);
            }
        }
    }

    function _setBodyMessage(message, cls) {
        _tbody.html('<tr><td colspan="' + _columnLength + '" class="' + cls + '">' + message + '</td></tr>');
    }
}