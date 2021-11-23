function Form(option) {
    //fields
    var _option = option || {},
        _this = this,
        _inputs = [];

    //methods
    this.render = function (dom) {
        var elem = $('<div>').addClass('form').appendTo(dom);
        _createForm(elem);
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
            data[input.name] = input.getValue();
        }

        return data;
    }

    //private
    function _createForm(dom) {
        if (_option.style)
            dom.addClass(_option.style);

        _createColumns(dom);
        _createButtons(dom);
    }

    function _createColumns(dom) {
        var columns = _option.columns;
        if (!columns || !columns.length)
            return;

        for (var i = 0; i < columns.length; i++) {
            _createFormItem(dom, columns[i]);
        }
    }

    function _createFormItem(dom, field) {
        var item = $('<div>').addClass('form-item').appendTo(dom);
        var input = new Input(field);
        _setInput(input);

        if (field.title) {
            $('<label>').addClass('form-label').html(field.title).appendTo(item);
            var formInput = $('<div>').addClass('form-input').appendTo(item);
            input.render(formInput);
        } else if (field.icon) {
            item.addClass('icon');
            $('<i>').addClass(field.icon).appendTo(item);
            input.render(item);
        } else {
            input.render(item);
        } 
    }

    function _createButtons(dom) {
        var buttons = _option.buttons;
        if (!buttons || !buttons.length)
            return;

        for (var i = 0; i < buttons.length; i++) {
            var btn = new Button(buttons[i]);
            btn.form = _this;
            btn.render(dom);
        }
    }

    function _setInput(input) {
        _inputs.push(input);
        _this[input.name] = input;
    }
}