function Input(option) {
    //fields
    var _option = option || {},
        _parent, _elem,
        _this = this;

    //properties
    this.name = _option.field;

    //methods
    this.render = function (dom) {
        _parent = dom;
        _createInput(dom);
    }

    this.validate = function () {
        _this.clearError();

        if (_option.type === 'hidden')
            return true;

        if (_option.type === 'component')
            return _option.component.validate();

        var value = $.trim(_this.getValue());
        if (_option.required && value === '') {
            _parent.addClass('error');
            return false;
        }

        return true;
    }

    this.clearError = function () {
        if (_option.type === 'component') {
            _option.component.clearError();
            return;
        }

        _parent.removeClass('error');
    }

    this.getValue = function () {
        var type = _option.type;
        var name = _option.field;
        if (type === 'component')
            return _option.component.getData();

        if (type === 'radio')
            return _parent.find('input[name="' + name + '"]:checked').val() || '';

        if (type === 'checkbox') {
            var inputs = _parent.find('input[name="' + name + '"]');
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
    }

    //private
    function _createInput(dom) {
        var type = _option.type;
        if (type === 'component') {
            _option.component.render(dom);
            return;
        }

        if (type === 'select') {
            _elem = $('<select>').appendTo(dom);
        } else if (type === 'textarea') {
            _elem = $('<textarea>').appendTo(dom);
        } else {
            _elem = $('<input>').attr('type', type).attr('autocomplete', 'off').appendTo(dom);
        }

        _elem.attr('name', _this.name);
        if (_option.placeholder)
            _elem.attr('placeholder', _option.placeholder);
        if (_option.required)
            _elem.attr('required', true);
    }
}