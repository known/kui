function Form(elem, option) {
    //fields
    var _option = option,
        _elem = typeof elem === 'string' ? $('<div id="form' + elem + '" class="form">') : elem,
        _label = {},
        _inputs = [],
        _this = this;

    if (elem.length) {
        _init();
    }

    //properties
    this.elem = _elem;

    //methods
    this.render = function () {
        _init();
        return _elem;
    }

    this.validate = function () {
        var errors = [];
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            if (!input.validate()) {
                errors.push(input);
            }
        }
        return errors.length === 0;
    }

    this.clear = function () {
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            input.clearError();
            input.setValue('');
        }
    }

    this.getData = function () {
        var data = {};
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            data[input.id] = input.getValue();
        }
        return data;
    }

    this.setData = function (data) {
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            var value = data[input.id];
            input.setValue(value);
        }

        var e = { form: _this, data: data };
        _option.setData && _option.setData(e);
    }

    this.save = function (url, callback) {
        if (!_this.validate())
            return;

        var data = _this.getData();
        _option.onSaving && _option.onSaving(data);
        var formData = { data: JSON.stringify(data) };
        if (_option.submitData) {
            var sd = _option.submitData();
            $.extend(formData, sd);
        }

        Ajax.post(url, formData, function (id) {
            data.Id = id;
            _this.setData(data);
            callback && callback(data);
        });
    }

    //pricate
    function _init() {
        _label = {};
        _inputs = [];

        if (_option.fields) {
            _setFields(_option.fields);
        }

        if (_option.toolbar && _option.toolbar.length) {
            var toolbar = $('<div class="form-button">').appendTo(_elem.parent());
            _initToolbar(toolbar);
        }
    }

    function _initToolbar(container) {
        for (var i = 0; i < _option.toolbar.length; i++) {
            var item = _option.toolbar[i];
            container.append(Utils.createButton(item, { form: _this }));
        }
    }

    function _setFields(fields) {
        _elem.html('');
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            if (f.visible !== undefined && !f.visible)
                continue;

            if (f.type === 'hidden') {
                var input = new Input(_elem, f);
                _setInput(input);
            } else {
                var inputEl;
                if (f.label) {
                    if (_label[f.label]) {
                        inputEl = _label[f.label];
                    } else {
                        inputEl = _createItem(_elem, f);
                        _label[f.label] = inputEl;
                    }
                } else {
                    inputEl = _createItem(_elem, f);
                }

                var input = new Input(inputEl, f);
                _setInput(input);
            }
        }
    }

    function _createItem(parent, option) {
        var title = option.label || option.title;
        var item = $('<div class="form-item">').appendTo(parent);
        var label = $('<label class="form-label">').html(title + '：').appendTo(item);
        var input = $('<div class="form-input">').appendTo(item);

        if (option.required)
            label.addClass('required');

        if (option.labelWidth)
            label.css({ width: option.labelWidth });

        return input;
    }

    function _setInput(input) {
        _inputs.push(input);
        _this[input.id] = input;
    }
}

Form.bind = function (container, data, callback) {
    for (var p in data) {
        var elem = container.find('[name="' + p + '"]');
        if (elem.length) {
            var value = data[p];
            var dateFormat = elem.attr('placeholder');
            if (dateFormat) {
                var date = value instanceof Date ? value : new Date(value);
                value = date.format(dateFormat);
            }

            var nodeName = elem[0].nodeName;
            if ('DIV,P,SPAN,TD'.indexOf(nodeName) > -1) {
                elem.html(value);
            } else {
                elem.val(value);
            }

            callback && callback({ elem, value, data });
        }
    }
};