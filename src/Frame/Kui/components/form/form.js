function Form(elem, option) {
    //fields
    var _option = option,
        _formId = typeof elem === 'string' ? 'form' + elem : elem.attr('id'),
        _elem = typeof elem === 'string' ? $('#' + _formId) : elem,
        _titleText = _option.title,
        _label = {},
        _inputs = [],
        _this = this, _opened, _isDetail,
        _tabHeader, _tabContent,
        _tabId = _formId + '-tab-',
        _header, _title, _body, _form, _footer;

    //properties
    this.elem = _elem;
    this.body = null;
    this.option = _option;
    this.data = {};

    //methods
    this.render = function () {
        this.elem = _elem = $('<div>');
        _init();
        return _elem;
    }

    this.show = function (data, isDetail) {
        _opened = true;
        _isDetail = isDetail;
        data = data || { Id: '' };

        if (!_titleText) {
            var tab = getCurTab();
            _titleText = tab ? tab.title : '';
        }

        if (_header.length) {
            _title.html('');
            var icon = option.icon || 'fa fa-window-maximize';
            _title.append('<i class="' + icon + '">').append(_titleText);

            var actionName = data.Id === '' ? '【' + Language.New + '】' : (isDetail ? '【' + Language.Detail + '】' : '【' + Language.Edit + '】');
            var titleInfo = '';
            if (_option.titleInfo) {
                titleInfo = _option.titleInfo(data);
            }
            if (titleInfo.indexOf('【') > -1) {
                actionName = '';
            }
            _title.append(actionName + titleInfo);
        }

        _this.setData(data, isDetail);

        if (_option.tabs) {
            _tabHeader.find('li:eq(0)').click();
        }

        if (_footer) {
            isDetail ? _footer.hide() : _footer.show();
            if (!_option.tabs) {
                _body.css({ bottom: (isDetail ? 0 : 40) + 'px' });
            }
        }

        _elem.removeClass('collapse');
        _elem.show();
    }

    this.close = function () {
        if (_opened) {
            _elem.hide();
        }
    }

    this.setToolbar = function (toolbar) {
        this.option.toolbar = toolbar;
        _setToolbar(toolbar);
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
        var data = {}, extNames = [];
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            if (input.name && input.type !== 'html') {
                if (input.name.indexOf('.') > -1) {
                    var names = input.name.split('.');
                    if (!data[names[0]]) {
                        extNames.push(names[0]);
                        data[names[0]] = {};
                    }
                    data[names[0]][names[1]] = input.getValue();
                } else {
                    data[input.name] = input.getValue();
                }
            }
        }

        if (extNames.length) {
            for (var i = 0; i < extNames.length; i++) {
                data[extNames[i]] = JSON.stringify(data[extNames[i]]);
            }
        }

        return data;
    }

    this.setData = function (data, isDetail) {
        this.data = data;
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            input.clearError();
            input.data = data;

            if (isDetail) {
                input.setReadonly(true)
            } else {
                input.setReadonly(input.readonly);
            }

            if (input.name && input.name.indexOf('.') > -1) {
                var names = input.name.split('.');
                if (!$.isPlainObject(data[names[0]])) {
                    data[names[0]] = JSON.parse(data[names[0]] || '{}');
                }
                input.setValue(data[names[0]][names[1]], isDetail);
            } else {
                var value = data[input.name];
                input.setValue(value, isDetail);
            }
        }

        var e = { form: _this, data: data, isDetail: isDetail };
        _option.setData && _option.setData(e);
    }

    this.setReadonly = function (readonly) {
        for (var i = 0; i < _inputs.length; i++) {
            var input = _inputs[i];
            input.setReadonly(readonly);
        }
    }

    this.setInput = function (input) {
        _setInput(input);
    }

    this.load = function (url, callback) {
        _option.url = url;
        Ajax.get(url, null, function (data) {
            _this.setData(data);
            callback && callback({ form: _this, data: data });
        });
    }

    this.reload = function () {
        _load(_option.url);
    }

    this.save = function (url, callback) {
        if (!_this.validate())
            return;

        var data = _this.getData();
        _option.onSaving && _option.onSaving(data);

        var files = [];
        if (_option.fields) {
            files = _option.fields.filter(function (f) {
                return f.type && f.type === 'file';
            });
        }

        if (files.length) {
            Ajax.upload(files[0].field, url, data, saveCallback);
        } else {
            var formData = { data: JSON.stringify(data) };
            if (_option.submitData) {
                var sd = _option.submitData();
                $.extend(formData, sd);
            }
            Ajax.post(url, formData, saveCallback);
        }

        function saveCallback(id) {
            data.Id = id;
            if (_option.tabs) {
                _this.show(data, false);
            } else {
                _this.close();
            }
            callback && callback(data);
        }
    }

    //init
    if (_elem.length) {
        _init();
        if (!_option.isPrint) {
            Page.complete();
        }
    }

    //pricate
    function _init() {
        if (_option.tabs) {
            _initTabElement(_option.tabs);
        } else {
            _initFormElement();
        }

        if (_option.style) {
            _form.addClass(_option.style);
        }

        if (_option.ahtml) {
            _body.append(_option.ahtml);
        }

        _this.body = _body;
        _initFields(_form);

        if (_option.toolbar && _option.toolbar.length) {
            _setToolbar(_option.toolbar);
        } else {
            _body.css({ bottom: 0 });
        }

        if (_option.url) {
            _load(_option.url);
        }
    }

    function _initTabElement(tabs) {
        _elem.addClass('tabs tabs-fit tabs-form');
        _header = $('<div class="tabs-header">').appendTo(_elem);
        _title = $('<div class="tabs-title">').appendTo(_header);
        _tabHeader = $('<ul>').appendTo(_header);
        _createHeadToolbar(_header);
        _tabContent = $('<div class="tabs-body">').appendTo(_elem);
        _body = $('<div class="tabs-item active" style="padding:0;">').attr('id', _tabId + '0').appendTo(_tabContent);
        _form = $('<div class="form">').appendTo(_body);

        for (var i = 0; i < tabs.length; i++) {
            var item = tabs[i];
            item.index = i;
            var li = $('<li>')
                .append(item.name)
                .appendTo(_tabHeader)
                .data('item', item)
                .on('click', function () {
                    var item = $(this).data('item');
                    _itemClick($(this), item);
                    var head = _this.getData();
                    if (item.onClick) {
                        item.onClick({ head: head, item: item.component });
                    } else if (item.component && item.component.load) {
                        item.component.load({ head: head, isDetail: _isDetail });
                    }
                });
            if (i === 0) {
                li.addClass('active');
            }
        }
    }

    function _itemClick(elem, item) {
        _tabHeader.find('li').removeClass('active');
        elem.addClass('active');
        var index = item.index || 0;
        var id = _tabId + index;
        var itemEl = $('#' + id);
        if (!itemEl.length) {
            itemEl = $('<div class="tabs-item">').attr('id', id).appendTo(_tabContent);
            new Router(itemEl, {}).route(item);
        }

        $('.tabs-item', _tabContent).removeClass('active');
        itemEl.addClass('active');
    }

    function _initFormElement() {
        if (_option.card) {
            _elem.addClass('form-card');
        } else if (_option.info) {
            _elem.addClass('form-info');
        }

        if (_elem.hasClass('form-card')) {
            _header = $('<div class="form-card-header">').appendTo(_elem);
            _title = $('<div class="form-title">').appendTo(_header);
            _createHeadToolbar(_header);
            _body = $('<div class="form-card-body">').appendTo(_elem);
            _form = $('<div class="form">').appendTo(_body);
        } else if (_elem.hasClass('form-info')) {
            var icon = _option.icon || 'fa fa-window-maximize';
            _header = $('<div class="form-info-header">').appendTo(_elem);
            _title = $('<div>')
                .append('<i class="' + icon + '">')
                .append(_option.title)
                .appendTo(_header);
            _body = $('<div class="form-info-body">').appendTo(_elem);
            _form = $('<div class="form">').appendTo(_body);
        } else {
            _body = _elem;
            if (!_elem.length) {
                _form = $('<div class="form">').appendTo(_body);
            } else {
                _form = _elem;
            }
        }
    }

    function _initFields(container) {
        if (_option.fields && _option.fields.length) {
            var fields = _option.fields.filter(function (f) {
                return f.type && f.type !== '';
            });
            _setFields(container, fields);
        } else {
            var inputs = _elem.find('input,select,textarea');
            for (var i = 0; i < inputs.length; i++) {
                var el = $(inputs[i]);
                var name = el.attr('name');
                if (name && name.length) {
                    var exist = _inputs.filter(function (f) { return f.name === name; });
                    if (!exist.length) {
                        _setInput(new Input(el));
                    }
                }
            }
        }
    }

    function _setToolbar(toolbar) {
        if (_elem.hasClass('form-card')) {
            if (!_footer) {
                _footer = $('<div class="form-card-footer">').appendTo(_elem);
            }
            _footer.html('');
            _initToolbar(_footer, toolbar);
            Utils.createButton({
                icon: 'fa fa-close', text: Language.Close, style: 'danger', handler: function () {
                    _this.close();
                }
            }).appendTo(_footer);
        } else {
            if (!_footer) {
                _footer = $('<div class="form-button">').appendTo(_form);
                if (_option.labelWidth) {
                    _footer.css({ marginLeft: (_option.labelWidth + 20) + 'px' });
                }
            }
            _footer.html('');
            _initToolbar(_footer, toolbar);
        }
    }

    function _initToolbar(container, toolbar) {
        for (var i = 0; i < toolbar.length; i++) {
            var item = toolbar[i];
            Utils.createButton(item, { form: _this }).appendTo(container);
        }
    }

    function _load(url) {
        if (_option.isPrint) {
            $.ajax({
                url: url, async: false,
                success: function (data) {
                    _this.setData(data);
                }
            });
        } else {
            Ajax.get(url, null, function (data) {
                _this.setData(data);
            });
        }
    }

    function _setFields(container, fields) {
        container.html('');
        for (var i = 0; i < fields.length; i++) {
            var f = fields[i];
            if (f.visible !== undefined && !f.visible)
                continue;

            f.form = _this;
            if (f.type === 'hidden') {
                var obj = new Input(container, f);
                _setInput(obj);
            } else {
                var input;
                if (f.label) {
                    if (_label[f.label]) {
                        input = _label[f.label];
                    } else {
                        input = _createItem(container, f);
                        _label[f.label] = input;
                    }
                } else {
                    input = _createItem(container, f);
                }

                if (f.type === 'html') {
                    _setInputHtml(f, input);
                } else {
                    var obj = new Input(input, f);
                    _setInput(obj);
                    _setInputHtml(f, input);
                }

                if (f.unit)
                    $('<span class="form-unit">').html(f.unit).appendTo(input);
                if (f.tips)
                    $('<span class="form-tips">').html(f.tips).appendTo(input);
            }
        }
    }

    function _setInputHtml(field, input) {
        if (!field.inputHtml)
            return;

        var html = field.inputHtml;
        if (typeof html === 'function') {
            html({ form: _this, parent: input });
        } else {
            $(html).appendTo(input);
        }
    }

    function _createItem(parent, option) {
        var title = option.label || option.title || '';
        if (title.length)
            title += '：';

        var item = $('<div class="form-item">').appendTo(parent);
        var label = $('<label class="form-label">').html(title).appendTo(item);
        var input = $('<div class="form-input">').appendTo(item);
        var blockForm = _elem.hasClass('form-block');

        if (option.lineBlock || (blockForm && option.type === 'textarea'))
            item.addClass('block');
        if (option.inputBlock || (!blockForm && option.type === 'textarea'))
            input.addClass('block');
        if (option.colSpan)
            item.addClass(option.colSpan);
        if (option.required)
            label.addClass('required');
        if (_option.labelWidth) {
            label.css({ width: _option.labelWidth + 'px' });
            if (option.inputBlock || option.lineBlock || option.type === 'textarea') {
                input.css({ marginLeft: (_option.labelWidth + 20) + 'px' });
            }
        }

        return input;
    }

    function _setInput(input) {
        _inputs.push(input);
        _this[input.name] = input;
    }

    function _createHeadToolbar(container) {
        var toolbar = $('<div class="right-toolbar">').appendTo(container);
        $('<i class="fa fa-chevron-up">')
            .appendTo(toolbar)
            .click(function () {
                if (_elem.hasClass('collapse')) {
                    _elem.removeClass('collapse');
                    $(this).removeClass('fa-chevron-down').addClass('fa-chevron-up')
                } else {
                    _elem.addClass('collapse');
                    $(this).removeClass('fa-chevron-up').addClass('fa-chevron-down');
                }
            });
        $('<i class="fa fa-close">')
            .appendTo(toolbar)
            .click(function () {
                _elem.hide();
                _option.onClose && _option.onClose();
            });
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

            callback && callback({ elem: elem, value: value, data: data });
        }
    }
};