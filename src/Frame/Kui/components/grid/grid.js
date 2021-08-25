function Grid(name, option) {
    //field
    var _gridId = 'grid' + name,
        _toolbar,
        _queryId = _gridId + 'Query', _query, querys = [],
        _elem = $('#' + _gridId),
        index = option.index === undefined ? true : option.index,
        fixed = option.fixed === undefined ? true : option.fixed,
        isEdit = option.edit,
        isImport = option.import,
        autoQuery = option.autoQuery === undefined ? (option.url ? true : false) : option.autoQuery,
        showPage = option.page === undefined ? (option.url ? true : false) : option.page,
        pageSizes = [10, 20, 50, 100, 500, 1000],
        action = $.extend({
            add: function (e) { e.grid.addRow(option.row || {}); },
            remove: function (e) { e.grid.removeRow(e.index); },
            up: function (e) { e.grid.moveRow(e.index, 'up', option.moveRowUrl); },
            down: function (e) { e.grid.moveRow(e.index, 'down', option.moveRowUrl); }
        }, option.action || {}),
        rowDataName = 'row';
    var _this = this, _moving = false,
        _view, _grid = _elem.parent(),
        _where = { field: '', order: '' },
        _pageCount = 0,
        _columnLength = 0, _dataColumns = [];
    var thead, tbody, page;
    var toolButtons = option.toolButtons || [];
    var columnButtons = toolButtons.filter(function (d) { return d.target && d.target.indexOf('grid') >= 0 });
    var _checkBox = option.showCheckBox || (!isImport && toolButtons.length > 0);
    var _multiSelect = option.multiSelect === undefined ? true : option.multiSelect;

    var sort = {};
    if (option.sortField) {
        var sortFields = option.sortField.split(',');
        var sortOrders = option.sortOrder.split(',');
        for (var i = 0; i < sortFields.length; i++) {
            sort[sortFields[i]] = sortOrders[i];
        }
    }
    if (isEdit) {
        index = false;
        if (option.fixed === undefined) {
            fixed = false;
        }
    }
    if (isEdit || isImport) {
        showPage = false;
        _checkBox = false;
    }
    if (showPage) {
        _where.page = 1;
        _where.limit = 10;
    }

    //property
    this.elem = _elem;
    this.option = option;
    this.name = name;
    this.columns = [];
    this.data = [];
    this.where = option.where || {};
    this.total = 0;

    //method
    this.render = function () {
        _gridId = 'grid' + name;
        _gridTop = 0;
        _view = $('<div class="grid-view">');
        _grid = $('<div class="grid">').appendTo(_view);
        _elem = $('<table>').attr('id', _gridId).appendTo(_grid);
        _init();
        return _view;
    }

    this.setDetail = function (isDetail) {
        if (_toolbar) {
            if (isDetail) {
                _toolbar.elem.hide();
            } else {
                _toolbar.elem.show();
            }
        }

        if (_query) {
            if (isDetail) {
                _query.elem.removeClass('hide').css({ paddingTop: '5px' });
            } else {
                _query.elem.addClass('hide');
            }
        }

        _setGridTop();
    }

    this.setIsEdit = function (isEditable) {
        isEdit = isEditable;
    }

    this.setColumns = function (columns) {
        _dataColumns = [];
        columns = columns || [];
        if (option.showModifyBy) {
            columns.push({ title: Language.ModifyBy, field: 'ModifyBy', width: '100px' });
            columns.push({ title: Language.ModifyTime, field: 'ModifyTime', width: '140px', placeholder: 'yyyy-MM-dd HH:mm:ss' });
        }
        if (option.showCreateBy) {
            columns.push({ title: Language.CreateBy, field: 'CreateBy', width: '100px' });
            columns.push({ title: Language.CreateTime, field: 'CreateTime', width: '140px', placeholder: 'yyyy-MM-dd HH:mm:ss' });
        }
        this.columns = columns;

        _columnLength = 0;
        thead.html('');
        if (index) {
            _columnLength += 1;
            $('<th class="index">').appendTo(thead);
        }
        if (_checkBox) {
            _columnLength += 1;
            setHeadCheckBox();
        }
        if (columnButtons.length > 0 && !option.isTradition) {
            _columnLength += 1;
            $('<th class="center tb-head">').html(Language.Operate).appendTo(thead);
        }
        querys = option.querys || [];
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            if (column.query && !isEdit && !isImport) {
                querys.push($.extend({ prefixType: 'LG' }, column));
            }

            if (column.hideColumn !== undefined && column.hideColumn)
                continue;
            if (column.visible !== undefined && !column.visible)
                continue;

            var head = getColumnHead(column);
            var th = $('<th>').append(head).appendTo(thead);
            
            if (column.width) {
                th.css({ width: column.width });
            }
            if (column.field) {
                th.attr('field', column.field);
            }

            setAlignClass(th, column.align);

            if (isImport) {
                if (column.required) {
                    th.addClass('red');
                }
                if (column.code) {
                    th.append(' *').css({ cursor: 'pointer' }).data('column', column).click(function () {
                        var col = $(this).data('column');
                        var codes = Utils.getCodes(col.code);
                        var content = '<h3 style="padding:10px;">' + col.title + Language.CodeOptionTip + '</h3>';
                        content += '<div style="padding:0 10px 10px 10px;">';
                        for (var i = 0; i < codes.length; i++) {
                            var data = codes[i];
                            var code = data.Code === 0 ? 0 : (data.Code || data);
                            content += '<p>' + code;
                            if (data.Name) {
                                content += '-' + data.Name;
                            }
                            content += '</p>';
                        }
                        content += '</div>';
                        Layer.open({ width: 300, height: 200, content: content, showClose: true });
                    });
                }
            } else {
                if (column.sort || sort[column.field]) {
                    th.addClass('sorting').append('<i class="fa fa-caret-down"></i><i class="fa fa-caret-up"></i>');
                    th.on('click', function () {
                        var $this = $(this), field = $this.attr('field');
                        sort = {};
                        if (_where.order === 'asc') {
                            sort[field] = 'desc';
                        } else {
                            sort[field] = 'asc';
                        }
                        _elem.find('th').removeClass('asc desc');
                        $this.addClass(sort[field]);
                        _this.reload();
                    });
                }
                th.removeClass('asc desc');
                if (sort[column.field]) {
                    th.addClass(sort[column.field]);
                }
            }

            _dataColumns.push(column);
            _columnLength += 1;
        }
    }

    this.setData = function (data) {
        this.data = data || [];
        tbody.html('');
        if (!data.length && !isEdit) {
            setErrorMessage(Language.NoDataFound);
        } else {
            $(data).each(function (i, d) {
                setDataRow(!isEdit, i, d);
            });
        }
    }

    this.reload = function (where, isLoad) {
        var qdata = _query ? _query.getData() : {};
        $.extend(this.where, where || {}, qdata);
        if (option.querys) {
            queryData(this.where);
        } else {
            _where.load = isLoad === 0 ? 0 : 1;
            _where.query = JSON.stringify(this.where);
            var aFields = [], aSorts = [];
            for (var f in sort) {
                aFields.push(f);
                aSorts.push(sort[f]);
            }
            _where.field = aFields.join(',');
            _where.order = aSorts.join(',');
            queryData(_where);
        }
    }

    this.getSelected = function () {
        var rows = [];
        _elem.find('tbody .checkbox :checked').each(function () {
            var tr = $(this).parent().parent();
            var idx = tbody.find('tr').index(tr);
            var row = $(this).data(rowDataName);
            row.index = idx;
            rows.push(row);
        });
        return rows;
    }

    this.addRow = function (item) {
        setDataRow(false, this.data.length, item);
        this.data.push(item);
    }

    this.removeRow = function (index) {
        tbody.find('tr:eq(' + index + ')').remove();
        this.data.splice(index, 1);
    }

    this.moveRow = function (index, direct, url) {
        if (_moving)
            return;

        if (direct === 'up') {
            if (index === 0) {
                Layer.tips(Language.CanNotMoveUp);
                return;
            }

            moveUpRow(this.data, index, url);
        } else if (direct === 'down') {
            if (index >= this.data.length - 1) {
                Layer.tips(Language.CanNotMoveDown);
                return;
            }

            moveDownRow(this.data, index, url);
        }
    }

    this.getData = function () {
        acceptChange();
        return _this.data;
    }

    this.getValue = function (row, column) {
        var value = row[column.field];
        if (value === null)
            return '';

        if (column.valueFormat) {
            return column.valueFormat({ value: value, row: row, column: column });
        } else if (column.placeholder) {
            if (value instanceof Date) {
                return value;
            } else if (isNaN(value) && !isNaN(Date.parse(value))) {
                return new Date(value);
            }
        } else if (column.code) {
            return getCodeCellText(column.code, value);
        } else {
            return value || value === 0 ? value : '';
        }
    }

    this.validate = function () {
        return true;
    }

    //private
    function setErrorMessage(message) {
        tbody.html('<tr><td colspan="' + _columnLength + '" class="center error">' + message + '</td></tr>');
    }

    function queryData(data) {
        tbody.html('<tr><td colspan="' + _columnLength + '" class="center">' + Language.Loading + '......</td></tr>');
        $.ajax({
            type: 'post', url: option.url, data: data,
            cache: false, async: true,
            success: function (result) {
                if ($.isArray(result)) {
                    _this.total = result.length;
                    _setQueryData(result);
                } else {
                    _this.total = result.count;
                    _setPageInfo(result.count)
                    _setQueryData(result.data);
                    option.summary && option.summary(result.summary);
                }
            },
            error: function () {
                setErrorMessage(Language.ServerError);
            }
        });
    }

    function _setQueryData(data) {
        if (option.setData) {
            option.setData({ grid: _this, data: data });
        } else {
            _this.setData(data);
        }
    }

    function queryPage(pageIndex) {
        if (_pageCount === 0 || pageIndex <= 0 || pageIndex > _pageCount)
            return;
        _where.page = pageIndex;
        _this.reload(null, 0);
    }

    function setAlignClass(elm, align) {
        align = align || '';
        if (align === 'center') {
            elm.addClass('center');
        } else if (align === 'right') {
            elm.addClass('text-right');
        }
    }

    function getColumnHead(column) {
        if (column.action) {
            var btn = $('<span>').addClass('link').data('action', column.action);
            if (column.icon) {
                btn.addClass(column.icon);
            } else {
                btn.html(column.title);
            }
            btn.on('click', function () {
                var code = $(this).data('action');
                action[code] && action[code].call(this, { grid: _this, form: option.form });
            });
            return btn;
        }

        return column.title;
    }

    function setDataRow(alter, idx, row) {
        var tr = $('<tr>').appendTo(tbody);
        if (alter && (idx + 1) % 2 === 0) {
            tr.addClass('alter');
        }
        if (index) {
            tr.append('<td class="center">' + (idx + 1) + '</td>');
        }
        if (_checkBox) {
            var td = $('<td class="center checkbox">').appendTo(tr);
            var chkHtml = _multiSelect
                ? '<input type="checkbox">'
                : '<input type="radio" name="gridCheck">';
            $(chkHtml).data(rowDataName, row).on('change', function () {
                if ($(this).is(':checked')) {
                    setSelectRow($(this), true);
                } else {
                    setSelectRow($(this), false);
                }
            }).appendTo(td);
        }
        if (columnButtons.length > 0 && !option.isTradition) {
            var td = $('<td class="center btns">').data(rowDataName, row).appendTo(tr);
            _initGridToolbar(td);
        }
        for (var i = 0; i < _dataColumns.length; i++) {
            var column = _dataColumns[i];
            var td = $('<td>').appendTo(tr);
            setAlignClass(td, column.align);

            if (column.field && column.field.indexOf('.') > -1) {
                var names = column.field.split('.');
                if (!$.isPlainObject(row[names[0]])) {
                    row[names[0]] = JSON.parse(row[names[0]] || '{}');
                }
            }

            if (column.format) {
                var format = column.format;
                if (typeof format === 'string' && format === 'detail') {
                    format = function (d, e) {
                        return $('<span class="link">')
                            .html(row[column.field])
                            .data('data', d)
                            .on('click', function () {
                                var data = $(this).data('data');
                                e.form && e.form.show(data, true);
                            });
                    }
                }
                var tdc = format(row, {
                    index: idx, tr: tr, td: td, column: column,
                    grid: _this, form: option.form
                });
                td.append(tdc);
            } else if (column.field) {
                setCellHtml(td, column, row);
            }

            if (_checkBox) {
                var chkType = _multiSelect ? ':checkbox' : ':radio';
                td.on('click', function (e) {
                    fullSelectRow(false);
                    var parent = $(this).parent(),
                        chk = parent.find(chkType);
                    chk[0].checked = !chk.is(':checked');
                    if (chk[0].checked) {
                        parent.addClass('selected');
                    } else {
                        parent.removeClass('selected');
                    }
                });

                if (option.dblclick) {
                    td.on('dblclick', function (e) {
                        var parent = $(this).parent(),
                            chk = parent.find(chkType);
                        var data = chk.data(rowDataName);
                        option.dblclick({ row: data });
                    });
                }
            }

            if (column.actionFormat) {
                var tdc = column.actionFormat(row, {
                    index: idx, tr: tr, td: td, column: column
                });
                td.append(tdc);
                tr.find('[action]').on('click', function (e) {
                    acceptChange();
                    var code = $(this).attr('action');
                    var trObj = $(this).parentsUntil('tbody').last();
                    var trIdx = tbody.find('tr').index(trObj);
                    var row = _this.data[trIdx];
                    action[code] && action[code].call(this, {
                        grid: _this, form: option.form, row: row, index: trIdx
                    });
                });
            }
        }
    }

    function acceptChange() {
        if (isEdit) {
            tbody.find('tr').each(function (i, el) {
                $(el).find('input,select,textarea').each(function (j, elem) {
                    var input = new Input($(elem));
                    if (input.name) {
                        _this.data[i][input.name] = input.getValue();
                    }
                });
            });
        }
    }

    function setCellHtml(parent, column, data) {
        parent.html('');
        var value;
        if (column.field.indexOf('.') > -1) {
            var names = column.field.split('.');
            value = data[names[0]][names[1]];
        } else {
            value = data[column.field];
        }

        if (isEdit && column.type) {
            column.value = value || '';
            new Input(parent, column);
            return;
        }

        if (value === null || value === undefined || value === '')
            return;

        if (column.type === 'file') {
            $('<span class="link">')
                .data('id', data[column.idField])
                .html(Language.Attachment)
                .appendTo(parent)
                .on('click', function () {
                    BizFile.download($(this).data('id'));
                });
        } else {
            var text = value;
            if (column.placeholder) {
                if (value instanceof Date) {
                    text = value.format(column.placeholder);
                } else if (isNaN(value) && !isNaN(Date.parse(value))) {
                    text = new Date(value).format(column.placeholder);
                }
            } else if (column.code) {
                if ('YesNo,HasNot,Enabled'.indexOf(column.code) > -1) {
                    if (value === '1' || value === '0') {
                        value = parseInt(value);
                    }
                    text = getCodeCellText(column.code, value);
                    var color = value === 1 ? 'success' : 'gray';
                    text = '<span class="badge ' + color + '">' + text + '</span>';
                } else {
                    text = getCodeCellText(column.code, value);
                }
            } else {
                text = value || value === 0 ? value : '';
            }
            parent.html(text);
        }
    }

    function getCodeCellText(category, value) {
        if (!(value || value === 0)) {
            return '';
        }

        return Utils.getCodeName(category, value);
    }

    function setHeadCheckBox() {
        var th = $('<th class="check">').appendTo(thead);
        if (!_multiSelect)
            return;

        $('<input type="checkbox">').on('change', function () {
            if ($(this).is(':checked')) {
                fullSelectRow(true);
            } else {
                fullSelectRow(false);
            }
        }).appendTo(th);
    }

    function fullSelectRow(checked) {
        var chkType = _multiSelect ? ':checkbox' : ':radio';
        _elem.find('tbody ' + chkType).each(function () {
            setSelectRow($(this), checked);
        });
        if (!checked && _multiSelect) {
            _elem.find('.check ' + chkType)[0].checked = false;
        }
    }

    function setSelectRow(checkbox, checked) {
        checkbox[0].checked = checked;
        if (checked) {
            checkbox.parent().parent().addClass('selected');
        } else {
            checkbox.parent().parent().removeClass('selected');
        }
    }

    function moveUpRow(data, idx, url) {
        _moving = true;
        _elem.find('tbody tr').removeClass('selected');
        var current = _elem.find('tbody tr:eq(' + idx + ')').addClass('selected');

        if (url) {
            var row = data[idx];
            $.post(url, { id: row.Id, direct: 'up' }, function () {
                moveUpRow(data, idx);
            });
        } else {
            data.splice(idx - 1, 0, data[idx]);
            data.splice(idx + 1, 1);

            var prev = current.prev();
            current.insertBefore(prev);

            if (index) {
                var prevTd = prev.find('td:first');
                prevTd.html(parseInt(prevTd.html()) + 1);
                var currTd = current.find('td:first');
                currTd.html(parseInt(currTd.html()) - 1);
            }
            _moving = false;
        }
    }

    function moveDownRow(data, idx, url) {
        _moving = true;
        _elem.find('tbody tr').removeClass('selected');
        var current = _elem.find('tbody tr:eq(' + idx + ')').addClass('selected');

        if (url) {
            var row = data[idx];
            $.post(url, { id: row.Id, direct: 'up' }, function () {
                moveDownRow(data, idx);
            });
        } else {
            data.splice(idx + 2, 0, data[idx]);
            data.splice(idx, 1);

            var next = current.next();
            if (next) {
                current.insertAfter(next);
            }

            if (index) {
                var currTd = current.find('td:first');
                currTd.html(parseInt(currTd.html()) + 1);
                var nextTd = next.find('td:first');
                nextTd.html(parseInt(nextTd.html()) - 1);
            }
            _moving = false;
        }
    }

    function _setPageInfo(count) {
        if (!page.length) return;
        _pageCount = Math.ceil(count / _where.limit);
        page.find('.pi').val(_where.page);
        page.find('.pc').html(_pageCount);
        page.find('.pt').html(count);
    }

    function _setGridTop() {
        if (!fixed)
            return;

        setTimeout(function () {
            var top = 0;
            if (option.isTradition) {
                if (_toolbar)
                    top += _toolbar.elem[0].clientHeight;
                if (_query)
                    top += _query.elem[0].clientHeight;
            } else {
                if (_toolbar)
                    top += _toolbar.elem[0].clientHeight;
                else if (_query)
                    top += _query.elem[0].clientHeight;
            }
            if (top === 0)
                top = 5;
            _grid.css({ top: top + 'px' });
        }, 10);
    }

    function _init() {
        if (option.width) {
            _elem.css({ width: option.width });
        }
        thead = _elem.find('thead tr');
        if (!thead.length) {
            var head = $('<thead>').appendTo(_elem);
            thead = $('<tr>').appendTo(head);
        }
        tbody = _elem.find('tbody');
        if (!tbody.length) {
            tbody = $('<tbody>').appendTo(_elem);
        }
        page = _elem.parent().find('.page');
        if (showPage && !page.length) {
            _initPage();
        }
        if (fixed) {
            _grid.addClass('grid-fixed');
        }

        _initFooter();

        if (option.columns) {
            _this.setColumns(option.columns);
        }

        _initToolbar();
        _initQuery();
        _setGridTop();

        if (option.url && autoQuery) {
            _this.reload(option.where);
        }
    }

    function _initPage() {
        page = $('<div class="pager">');
        var pn = $('<span class="pn">').appendTo(page);
        $('<i class="fa fa-refresh" title="' + Language.Refresh + '">').on('click', function () { queryPage(_where.page); }).appendTo(pn);
        $('<i class="fa fa-step-backward" title="' + Language.First + '">').on('click', function () { queryPage(1); }).appendTo(pn);
        $('<i class="fa fa-caret-left" title="' + Language.Previous + '">').on('click', function () { queryPage(_where.page - 1); }).appendTo(pn);
        $('<i class="fa fa-caret-right" title="' + Language.Next + '">').on('click', function () { queryPage(_where.page + 1); }).appendTo(pn);
        $('<i class="fa fa-step-forward" title="' + Language.Last + '">').on('click', function () { queryPage(_pageCount); }).appendTo(pn);
        var pm = $('<span class="pm">').appendTo(page);
        pm.append(Language.PagerNavTo);
        $('<input type="text" class="pi">').on('change', function () { queryPage($(this).val()); }).appendTo(pm);
        pm.append('/<span class="pc"></span>' + Language.PagerPerPage);
        var ps = $('<select class="ps">').on('change', function () { _where.limit = $(this).val(); queryPage(1); }).appendTo(pm);
        $(pageSizes).each(function (i, d) { ps.append('<option value="' + d + '">' + d + '</option>'); });
        var totalText = Utils.format(Language.PagerTotal, '<span class="pt"></span>');
        pm.append(totalText);
        pm.append('</span>');
        _grid.after(page);
        if (fixed) {
            page.addClass('pager-fixed');
            _grid.css({ bottom: '30px' });
        }
    }

    function _initFooter() {
        if (!option.footer)
            return;

        var footer = $('<div class="grid-footer">')
            .append(option.footer)
            .appendTo(_grid.parent());
        if (fixed) {
            footer.addClass('grid-footer-fixed');
            setTimeout(function () {
                var footerHeight = footer.outerHeight();
                if (page.length) {
                    page.css({ bottom: footerHeight + 'px' });
                    footerHeight += 30;
                }
                _grid.css({ bottom: footerHeight + 'px' });
            }, 100);
        }
    }

    function _initToolbar() {
        if (!toolButtons.length)
            return;

        var opt = {
            buttons: toolButtons,
            toolbar: option.toolbar,
            toolbarTips: option.toolbarTips,
            isTradition: option.isTradition,
            gridParameter: function () {
                var rows = _this.getSelected();
                return new GridManager(_this, option.form, rows);
            }
        };
        if (querys.length && option.isTradition) {
            opt.query = function () {
                if (_query.elem.hasClass('hide')) {
                    _query.elem.removeClass('hide').css({ paddingTop: 0 });
                } else {
                    _query.elem.addClass('hide').css({ paddingTop: '5px' });
                }
                _setGridTop();
            }
        }

        _toolbar = new Toolbar(opt);
        _grid.before(_toolbar.render());
    }

    function _initGridToolbar(td) {
        var opt = {
            buttons: columnButtons,
            toolbar: option.toolbar,
            isGridCell: true,
            onlyIcon: option.isIconButton,
            gridParameter: function () {
                var rows = [td.data(rowDataName)];
                return new GridManager(_this, option.form, rows);
            }
        };
        var toolbar = new Toolbar(opt);
        toolbar.render(td);
    }

    function _initQuery() {
        if (!querys.length)
            return;

        _query = new Query({
            id: _queryId,
            grid: _this,
            querys: querys,
            isTradition: option.isTradition,
            onSearch: option.onSearch
        });

        if (toolButtons.length && option.isTradition) {
            _query.elem.addClass('hide');
        }

        var existsExport = _this.columns.filter(function (d) { return d.export; });
        if (!toolButtons.length && (option.showBtnExport || existsExport.length > 0)) {
            Utils.createButton({
                icon: 'fa fa-sign-out', text: Language.Export, handler: function () {
                    var manger = new GridManager(_this, option.form);
                    manger.export();
                }
            }).appendTo(_query.elem);
        }

        _grid.before(_query.elem);
    }

    //init
    if (_elem.length) {
        _init();
    }
}