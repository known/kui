Picker.action = {};
function Picker(elem, option) {
    //field
    var _elem = typeof elem === 'string' ? $('[name="' + elem + '"]') : elem,
        _option = option || {},
        _multiSelect = false,
        _name = _elem.attr('name'),
        _text,
        _dataItemName = 'data';

    //init
    _init();

    //property
    this.name = _name;

    //method
    this.validate = function () {
        var value = $.trim(this.getValue());
        if (!_elem[0].disabled && _elem[0].required && value === '') {
            return false;
        }

        return true;
    }

    this.getValue = function () {
        var d = _elem.data(_dataItemName);
        return d && d.value ? d.value : _elem.val();
    }

    this.getData = function () {
        var d = _elem.data(_dataItemName);
        return d && d.data ? d.data : null;
    }

    this.setValue = function (value, text) {
        _elem.val(value);
        if (_text) {
            _text.val(text);
        }
    }

    //private
    function _init() {
        var pick = _option.pick || {};
        if (pick.action) {
            pick = Picker.action[pick.action] || {};
            $.extend(true, pick, _option.pick);
        }
        _multiSelect = pick.multiSelect || false;

        var btn = $('<span class="icon fa fa-ellipsis-h">').on('click', function () {
            _openPicker(pick);
        });
        if (pick.valueField === pick.textField) {
            _elem.attr('type', 'text').attr('disabled', true);
            btn.insertAfter(_elem);
        } else {
            _text = $('<input type="text">')
                .attr('name', _name + 'Name')
                .attr('disabled', true)
                .insertAfter(_elem);
            if (_option.form) {
                _option.form.setInput(new Input(_text, { readonly: true }));
            }
            btn.insertAfter(_text);
        }
    }

    function _openPicker(pick) {
        var obj;
        var dlg = Layer.open({
            title: pick.title,
            width: pick.width || 600, height: pick.height || 400,
            content: function (body) {
                if (pick.type === 'tree') {
                    obj = new Tree('treePick', { url: pick.url });
                } else {
                    pick.showCheckBox = true;
                    pick.multiSelect = _multiSelect;
                    if (!_multiSelect) {
                        pick.dblclick = function (e) {
                            _gridCallback(dlg, pick, [e.row]);
                        }
                    }
                    obj = new Grid('Pick', pick);
                }
                obj.render().appendTo(body);
                pick.onLoad && pick.onLoad({ form: _option.form, control: obj, option: pick });
            },
            buttons: [{
                text: Language.OK, handler: function (e) {
                    if (pick.type === 'tree') {
                        var node = obj.selectedNode;
                        if (!node) {
                            Layer.tips(Language.PleaseSelect + Language.Node + '！');
                            return;
                        }
                        _treeCallback(dlg, pick, node);
                    } else {
                        var rows = obj.getSelected();
                        if (!_multiSelect) {
                            if (!rows || rows.length === 0 || rows.length > 1) {
                                Layer.tips(Language.PleaseSelectOne);
                                return;
                            }
                        } else {
                            if (!rows || rows.length === 0) {
                                Layer.tips(Language.PleaseSelectOneAtLeast);
                                return;
                            }
                        }
                        _gridCallback(dlg, pick, rows);
                    }
                }
            }]
        });
    }

    function _treeCallback(dlg, pick, node) {
        var res = { form: option.form };
        res.value = node.id;
        res.text = node.title;
        res.data = node.data;
        _setElemData(res);
        pick.callback && pick.callback(res);
        dlg.close();
    }

    function _gridCallback(dlg, pick, rows) {
        var res = { form: option.form };
        if (_multiSelect) {
            var values = [], texts = [];
            for (var i = 0; i < rows.length; i++) {
                values.push(rows[i][pick.valueField]);
                texts.push(rows[i][pick.textField]);
            }
            res.value = values.join(',');
            res.text = texts.join(',');
            res.data = rows;
        } else {
            var row = rows[0];
            res.value = row[pick.valueField];
            res.text = row[pick.textField];
            res.data = row;
        }
        _setElemData(res);
        pick.callback && pick.callback(res);
        dlg.close();
    }

    function _setElemData(res) {
        _elem.data(_dataItemName, res.data);
        _elem.val(res.value);
        if (_text) {
            _text.val(res.text);
        }
    }
}