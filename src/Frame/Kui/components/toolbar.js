function Toolbar(option) {
    //fields
    var _option = option,
        _elem = $('<div class="toolbar">'),
        _toolbar = option.toolbar || {};
    var toolBtn = {
        add: { code: 'add', name: Language.New, icon: 'fa fa-plus', target: 'toolbar' },
        edit: { code: 'edit', name: Language.Edit, icon: 'fa fa-edit', target: 'grid' },
        remove: { code: 'remove', name: Language.Delete, icon: 'fa fa-trash-o', target: 'grid,batch' },
        import: { code: 'import', name: Language.Import, icon: 'fa fa-sign-in', target: 'toolbar' },
        export: { code: 'export', name: Language.Export, icon: 'fa fa-sign-out', target: 'toolbar' }
    };

    //properties
    this.elem = _elem;

    //methods
    this.render = function (dom) {
        _init(dom);
        return _elem;
    }

    //private
    function _init(dom) {
        if (_option.id) {
            _elem.attr('id', _option.id);
        }

        if (!_option.isTradition) {
            _elem.addClass('right');
        }

        if (_option.query) {
            _createQueryButton(_elem, _option.query);
        }

        for (var i = 0; i < _option.buttons.length; i++) {
            var btn = _option.buttons[i];
            if (typeof btn === 'string')
                btn = toolBtn[btn];

            var isToolbar = btn.target.indexOf('toolbar') >= 0;
            var isBatch = btn.target.indexOf('batch') >= 0;
            if (!option.isGridCell && !option.isTradition && !isToolbar && !isBatch)
                continue;

            if (btn.children && btn.children.length) {
                _createDropdownButton(_elem, btn);
            } else {
                _createButton(dom || _elem, btn);
            }
        }

        if (_option.toolbarTips) {
            var tips = $('<div class="toolbar-tips">').appendTo(_elem);
            $(_option.toolbarTips).appendTo(tips);
        }
    }

    function _createQueryButton(container, callback) {
        Utils.createButton({
            icon: 'fa fa-search', text: Language.Query, handler: function () {
                callback && callback();
            }
        }).appendTo(container);
    }

    function _createDropdownButton(container, btn) {
        var drop = $('<div class="dropdown">').appendTo(container);
        $('<div class="title">')
            .append('<i class="' + btn.icon + '">')
            .append('<span>' + btn.name + '</span>')
            .append('<i class="fa fa-caret-down arrow">')
            .appendTo(drop);

        var dl = $('<dl class="child">').appendTo(drop);
        btn.children.forEach(function (d) {
            _createButton(dl, d, '<dd>');
        });
    }

    function _createButton(container, btn, target) {
        if (!target) {
            if (_option.isGridCell) {
                target = _option.onlyIcon ? '<i>' : '<span>';
            } else {
                target = _option.onlyIcon ? '<i>' : '<button>';
            }
        }

        var obj = $(target)
            .data('item', btn)
            .on('click', function () {
                var item = $(this).data('item');
                var e = _option.gridParameter ? _option.gridParameter() : null;
                if (item.handler) {
                    item.handler.call(this, e);
                } else if (_toolbar[item.code]) {
                    _toolbar[item.code].call(this, e);
                }
            })
            .appendTo(container);
        if (_option.onlyIcon) {
            obj.addClass(btn.icon).attr('title', btn.name);
        } else if (_option.isGridCell) {
            obj.append(btn.name);
        } else {
            obj.append('<i class="' + btn.icon + '">')
                .append('<span>' + btn.name + '</span>');
        }
    }
}