//---------------------------grid---------------------------------------------//
var Grid = function (name, option) {
    this.name = name;
    this.option = option;

    var _grid = mini.get('grid' + name);
    $.extend(true, this, _grid);

    var _this = this;
    this.idField = _grid.getIdField();
    this.query = null;

    //public
    this.on = function (type, fn) {
        _grid.on(type, fn);
    };

    this.un = function (type, fn) {
        _grid.un(type, fn);
    };

    this.search = function (callback) {
        this._queryData(false, callback);
    };

    this.load = function (callback) {
        this._queryData(true, callback);
    };

    this.validate = function (tabsId, tabIndex) {
        _grid.validate();
        if (_grid.isValid())
            return true;

        if (tabsId) {
            var tabs = mini.get(tabsId);
            var tab = tabs.getTab(index);
            tabs.activeTab(tab);
        }

        var error = _grid.getCellErrors()[0];
        _grid.beginEditCell(error.record, error.column);
        return false;
    };

    this.getChanges = function (encode) {
        var data = _grid.getChanges();
        return encode ? mini.encode(data) : data;
    };

    this.getSelecteds = function (encode) {
        _grid.accept();
        var data = _grid.getSelecteds();
        return encode ? mini.encode(data) : data;
    };

    this.getLength = function () {
        return _grid.getData().length;
    };

    this.getData = function (encode) {
        var data = _grid.getData();
        return encode ? mini.encode(data) : data;
    };

    this.setData = function (data, callback) {
        this.clear();
        if (data) {
            _grid.setData(data);
            callback && callback(data);
        }
    };

    this.clear = function () {
        _grid.setData([]);
    };

    this.addRow = function (data, index) {
        if (!index) {
            index = _grid.getData().length;
        }

        _grid.addRow(data, index);
        _grid.cancelEdit();
        _grid.beginEditRow(data);
    };

    //this.updateRow = function (e, data) {
    //    e.sender.updateRow(e.record, data);
    //};

    this.deleteRow = function (uid) {
        var row = _grid.getRowByUid(uid);
        if (row) {
            _grid.removeRow(row);
        }
    };

    this.checkSelect = function (callback) {
        var rows = _grid.getSelecteds();
        if (rows.length === 0) {
            Message.tips('请选择一条记录！');
        } else if (rows.length > 1) {
            Message.tips('只能选择一条记录！');
        } else if (callback) {
            callback(rows[0]);
        }
    };

    this.checkMultiSelect = function (callback) {
        var rows = _grid.getSelecteds();
        if (rows.length === 0) {
            Message.tips('请选择一条或多条记录！');
        } else if (callback) {
            var data = this.getRowDatas(rows, null);
            callback(rows, data);
        }
    };

    this.deleteRows = function (url, callback) {
        this.checkMultiSelect(function (rows, data) {
            Message.confirm('确定要删除选中的记录？', function () {
                Ajax.action('删除', url, data, callback);
            });
        });
    };

    this.getRowDatas = function (rows, fields, encode) {
        var datas = [];
        if (fields) {
            $(rows).each(function (i, d) {
                var data = {};
                $(fields).each(function (i, p) {
                    data[p] = d[p] || '';
                });
                datas.push(data);
            });
        } else {
            var id = _grid.idField;
            $(rows).each(function (i, d) {
                datas.push(d[id] || '');
            });
        }
        return encode ? mini.encode(datas) : datas;
    };

    this.hideColumn = function (indexOrName) {
        var column = _grid.getColumn(indexOrName);
        _grid.updateColumn(column, { visible: false });
    };

    this.showColumn = function (indexOrName) {
        var column = _grid.getColumn(indexOrName);
        _grid.updateColumn(column, { visible: true });
    };

    //private
    this._onColumnRender = function (e) {
        var displayField = e.column.displayField;
        if (displayField === 'icon') {
            var value = e.record[e.column.field];
            return '<span class="mini-icon mini-iconfont ' + e.value + '"></span>';
        } else if (displayField.startWith('code.')) {
            var type = displayField.replace('code.', '');
            var code = Code.getCode(type, e.value);
            var text = e.value;
            if (code && code.text) {
                text += '-' + code.text;
            }
            return text;
        } else {
            return e.record[displayField];
        }
    };

    this._queryData = function (isLoad, callback) {
        var query = this.query ? this.query.getData(true) : '';
        _grid.clearSelect(false);
        _grid.load(
            { query: query, isLoad: isLoad },
            function (e) {
                if (callback) {
                    callback({ sender: this, result: e.result });
                }
            },
            function () {
                Message.tips({ content: '查询出错！', state: 'warning' });
            }
        );
        new ColumnsMenu(_grid);
    };

    this._initQuery = function () {
        if ($('#query' + name).length) {
            this.query = new Form('query' + name);
            this.query.setData(this.option.query);

            if (this.query.key) {
                this.query.key.on('buttonclick', function () {
                    _this.search();
                });
            }

            var btnSearch = mini.get('search', this.query);
            if (btnSearch) {
                btnSearch.on('click', function () {
                    _this.search();
                });
            }
        }
    };

    this._init = function () {
        this._initQuery();

        _grid.set(this.option);

        var columns = _grid.getColumns();
        for (var i = 0; i < columns.length; i++) {
            if (columns[i].displayField) {
                _grid.updateColumn(columns[i], {
                    renderer: _this._onColumnRender
                });
            }
        }
    };

    this._init();
    //console.log(this);
};