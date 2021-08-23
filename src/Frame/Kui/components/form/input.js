function Input(parent, option) {
    //fields
    var _parent = parent,
        _option = option || {},
        _elem,
        _readonly = _option.readonly === undefined ? false : option.readonly,
        _name, _data, _editor,
        _this = this;

    //init
    if (option && option.type) {
        _init();
    } else {
        _initElement();
    }

    //properties
    this.option = _option;
    this.elem = _elem;
    this.readonly = _readonly;
    this.name = _name;
    this.type = _option.type;
    this.value = '';
    this.data = {};

    //methods
    this.validate = function () {
        _this.clearError();

        if (_option.type === 'hidden')
            return true;

        if (_option.type === 'checkbox' && _data && _data.length === 1)
            return true;

        var value = $.trim(_this.getValue());
        if (_elem) {
            if (!_elem[0].disabled && _option.required && value === '') {
                _parent.addClass('error');
                return false;
            }
        }

        if (_option.required && value === '') {
            _parent.addClass('error');
            return false;
        }

        return true;
    }

    this.clearError = function () {
        _parent.removeClass('error');
    }

    this.getValue = function () {
        if (_option.type === 'label')
            return _this.value;

        if (_option.type === 'radio')
            return _parent.find('input[name="' + _name + '"]:checked').val() || '';

        if (_option.type === 'checkbox') {
            var inputs = _parent.find('input[name="' + _name + '"]');
            if (inputs.length === 1) {
                return inputs[0].checked ? 1 : 0;
            } else {
                var values = [];
                _parent.find('input[name="' + _name + '"]:checked').each(function (i, e) {
                    values.push($(e).val());
                });
                return values.join(',');
            }
        }

        return _elem.val();
    }

    this.setValue = function (value, isDetail) {
        _setValue(value, isDetail);
    }

    this.setReadonly = function (readonly) {
        _setReadonly(readonly);
    }

    this.setVisible = function (visible) {
        if (visible) {
            _parent.parent().show();
        } else {
            _parent.parent().hide();
        }
    }

    this.setUrl = function (url, callback) {
        _setUrl(url, callback);
    }

    this.getData = function () {
        if (_option.type === 'select') {
            return _elem.find(':selected').data('data');
        }

        var data = [];
        _parent.find('input:checked').each(function (i, e) {
            data.push($(e).data('data'));
        });
        return data;
    }

    this.setData = function (data, value) {
        _setData(_elem, _option, data, value);
    }

    this.change = function (callback) {
        _change(callback);
    }

    this.setUnit = function (unit, style) {
        var elm = parent.find('.form-unit').html(unit);
        if (style) {
            elm.css(style);
        }
    }

    this.setTips = function (tips, style) {
        var elm = parent.find('.form-tips').html(tips);
        if (style) {
            elm.css(style);
        }
    }

    //private
    function _init() {
        _id = _option.id || _option.field;
        _name = _option.field;
        var type = _option.type;
        if (type === 'label') {
            _elem = $('<div class="label">').appendTo(parent);
        } else if (type === 'radio') {
            _setData(parent, _option, _option.code);
        } else if (type === 'checkbox') {
            var data = _option.code;
            if (data === 'Enabled') {
                data = [{ Code: 1, Name: Language.Enable }];
            } else if (_option.label) {
                data = [{ Code: 1, Name: data === 'Enabled' ? Language.Enable : _option.title }];
            }
            if (data) {
                _setData(parent, _option, data);
            } else {
                _elem = $('<input type="checkbox" value="1">')
                    .attr('name', _name)
                    .appendTo(parent);
                if (_option.value === 1 || _option.value === '1')
                    _elem[0].checked = true;
            }
        } else if (type === 'picker') {
            _elem = $('<input type="hidden">').attr('name', _name).appendTo(parent);
            new Picker(_elem, _option);
        } else {
            if (type === 'select') {
                _elem = $('<select>').appendTo(parent);
                _setSelectData();
            } else if (type === 'editor') {
                _elem = $('<textarea>').attr('name', _name).appendTo(parent);
                _initEditor();
            } else if (type === 'textarea') {
                _elem = $('<textarea>').appendTo(parent);
            } else if (type === 'date') {
                var date = $('<div class="query-date">').appendTo(parent);
                _elem = $('<input type="text" autocomplete="off">').appendTo(date);
                $('<span class="icon fa fa-calendar">').on('click', function () { _elem.focus(); }).appendTo(date);
            } else {
                _elem = $('<input type="' + type + '" autocomplete="off">').appendTo(parent);
            }

            //_elem.attr('id', _id);
            _elem.attr('name', _name);

            if (type === 'file') {
                _elem.attr('id', _name);
                _elem.attr('accept', _option.fileExt || '.png,.jpg,.pdf,.doc,.docx.xls,.xlsx,.ppt,.pptx');
                if (_option.multiple)
                    _elem.attr('multiple', 'multiple');
            }

            if (_option.placeholder)
                _elem.attr('placeholder', _option.placeholder);
            if (_option.required)
                _elem.attr('required', true);
            if (_option.inputStyle)
                _elem.attr('style', _option.inputStyle);
            //if (_option.width)
            //    _elem.css({ width: _option.width });
            if (_option.readonly)
                _setReadonly(true);
            if (_option.change)
                _change(_option.change);
        }

        if (_option.value) {
            _setValue(_option.value);
        }
    }

    function _initElement() {
        _elem = parent;
        _parent = _elem.parent();
        _name = _elem.attr('name');
        _data = [];
        $.extend(_option, {
            field: _name,
            type: _elem[0].nodeName === 'SELECT' ? 'select' : _elem[0].type,
            required: _elem[0].required
        });
        if (_option.type === 'select') {
            _setSelectData();
        }
    }

    function _setReadonly(readonly) {
        if (_option.type === 'label')
            return;

        if (!readonly && _option.type === 'picker')
            return;

        if (_option.type === 'checkbox' || _option.type === 'radio') {
            parent.find('input').attr('disabled', readonly);
        } else if (_elem) {
            if (readonly)
                parent.find('.icon').hide();
            else
                parent.find('.icon').show();
            _elem.attr('disabled', readonly);
        }
    }

    function _setValue(value, isDetail) {
        _this.value = value;
        if (_option.type === 'file') {
            _elem.val('');
            var fileInfo = _elem.parent().find('.file');
            if (fileInfo.length) {
                fileInfo.html('');
            }
            var id = _this.data[_option.idField];
            if (id !== null && id !== '' && id !== undefined) {
                if (!fileInfo.length) {
                    fileInfo = $('<span class="file inline">').appendTo(_elem.parent());
                }
                //if (!isDetail) {
                //    $('<i class="fa fa-remove red">').data('id', id).on('click', function () {
                //        BizFile.delete($(this).data('id'));
                //    }).appendTo(fileInfo);
                //}
                $('<span class="link">').data('id', id).html(value).on('click', function () {
                    BizFile.download($(this).data('id'));
                }).appendTo(fileInfo);
            }
        } else if (_option.type === 'label') {
            var text = value;
            if (_option.code) {
                text = Utils.getCodeName(_option.code, value);
            }
            _elem.html(text);
        } else if (_option.type === 'radio') {
            var items = _parent.find('input[name="' + _name + '"]');
            for (var i = 0; i < items.length; i++) {
                items[i].checked = items[i].value === value;
            }
        } else if (_option.type === 'checkbox') {
            var items = _parent.find('input[name="' + _name + '"]');
            for (var i = 0; i < items.length; i++) {
                var itemValue = items[i].value;
                items[i].checked = value === 1 || value === true || value && value.indexOf(itemValue) > -1;
            }
        } else {
            var format = _elem.attr('placeholder');
            if (format) {
                if (value instanceof Date) {
                    value = value.format(format);
                } else if (isNaN(value) && !isNaN(Date.parse(value))) {
                    value = new Date(value).format(format);
                }
            }

            _elem.val(value);
            if (_editor) {
                _editor.txt.html(value);
            }
        }
    }

    function _setUrl(url, callback) {
        $.get(url, function (data) {
            _this.setData(data);
            callback && callback(data);
        });
    }

    function _setData(el, option, data, value) {
        if (!option.label)
            el.html('');

        if (!data)
            return;

        _data = Utils.getCodes(data);
        value = value || option.value;
        if (_data && _data.length) {
            var items = [];
            if (option.type === 'select') {
                var emptyText = '';
                if (option.emptyText !== undefined) {
                    emptyText = option.emptyText;
                } else {
                    emptyText = option.isQuery ? Language.All : Language.PleaseSelect;
                }
                if (emptyText !== '') {
                    items.push({ Code: '', Name: emptyText });
                }
            }

            for (var i = 0; i < _data.length; i++) {
                items.push(_data[i]);
            }

            for (var i = 0; i < items.length; i++) {
                var data = items[i];
                var id = data.Code === '' ? '' : (data.Code || data);
                var text = data.Name || id;
                if (option.type === 'select') {
                    _createSelectItem(el, items[i], id, text, value);
                } else {
                    _createRadioItem(el, items[i], id, text, option);
                }
            }
        }
    }

    function _setSelectData() {
        if (_option.code)
            _setData(_elem, _option, _option.code);
        if (_option.url)
            _setUrl(_option.url);
    }

    function _change(callback) {
        _elem.change(function (e) {
            var $this = $(this);
            callback && callback({
                form: _option.form,
                elem: $this,
                value: $this.val(),
                selected: $this.find(':selected').data('data')
            });
        });
    }

    function _createSelectItem(el, data, id, text, value) {
        var item = $('<option>')
            .data('data', data)
            .attr('value', id)
            .html(text)
            .appendTo(el);

        if (value && id === value) {
            item.attr('selected', true);
        }
    }

    function _createRadioItem(el, data, id, text, option) {
        if (data.Code === '-') {
            $('<br>').appendTo(el);
            return;
        }

        var label = $('<label class="form-radio">').appendTo(el);
        var item = $('<input>')
            .data('data', data)
            .attr('type', option.type)
            .attr('name', option.field)
            .attr('value', id)
            .appendTo(label);

        var value = option.value;
        if (value && id === value) {
            item.attr('checked', true);
        }

        if (option.onClick) {
            item.on('click', function () {
                option.onClick($(this).val());
            });
        }

        $('<span>').html(text).appendTo(label);
    }

    function _initEditor() {
        if (!window.wangEditor) {
            Utils.addJs(baseUrl + '/static/libs/wangEditor.min.js');
        }

        _elem.hide();
        var divId = 'editor' + _name;
        var div = _elem.before('<div id="' + divId + '" class="editor">');

        _editor = new window.wangEditor('#' + divId);
        _editor.config.onchange = function (html) {
            _elem.val(html);
        };

        if (OssClient.config.accessKeyId) {
            var oss = new OssClient();
            _editor.config.customUploadImg = function (resultFiles, insertImgFn) {
                var url = option.form.OssUrl.getValue();
                var path = option.form.OssPath.getValue();
                if (!url && !path) {
                    Layer.tips('OSSPath' + Language.NotEmpty + '！');
                    return;
                }
                var file = resultFiles[0];
                path += '/' + file.lastModified + file.name;
                oss.put(path, file, function (res) {
                    insertImgFn(url + res.name);
                });
            }
        } else {
            _editor.config.uploadImgServer = baseUrl + '/System/Upload';
        }

        setTimeout(function () { _editor.create(); }, 10);
    }
}