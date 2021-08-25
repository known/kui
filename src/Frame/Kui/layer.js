var Layer = {

    //field
    index: 100000,

    //public
    page: function (option) {
        return this._show('page', option);
    },

    open: function (option) {
        option.showMax = option.showMax === undefined ? true : option.showMax;
        return this._show('dialog', option);
    },

    loading: function (message) {
        message = message || '';
        if (message === '')
            return { close: function () { } };

        var _this = this, index = _this.index++, maskId = 'mask' + index, loadId = 'load' + index;
        $('<div class="mask">')
            .attr('id', maskId)
            .css({ zIndex: index })
            .appendTo($('body'));
        var load = $('<div class="loading">')
            .attr('id', loadId)
            .append('<i class="fa fa-spinner">')
            .append(message);
        var width = load.outerWidth();
        load.css({ marginLeft: -(width / 2) + 'px', zIndex: index + 1 }).appendTo($('body'));
        return {
            close: function () {
                $('#' + maskId + ',#' + loadId).remove();
                _this.index--;
            }
        };
    },

    tips: function (message) {
        message = message || '';
        if (message === '')
            return;

        var tip = $('.tips');
        if (!tip.length) {
            tip = $('<div class="tips">').css({ zIndex: this.index }).appendTo($('body'));
        }
        tip.html(message);
        var width = tip.outerWidth();
        var height = tip.outerHeight();
        tip.css({ marginLeft: -(width / 2) + 'px', marginTop: -(height / 2) + 'px' });
        setTimeout(function () { tip.remove(); }, 3000);
    },

    alert: function (message, callback) {
        var height = 150 - 42 - 42 - 10;
        var dlg = this._show('dialog', {
            showMax: false,
            icon: 'fa fa-info-circle', title: Language.Tips, width: 300, height: 150,
            content: '<div style="text-align:center;height:' + height + 'px"><div style="padding-top:15px;">' + message + '</div></div>',
            footer: '<button class="ok">' + Language.OK + '</button>'
        });
        dlg.layer.find('.dialog-footer .ok').click(function () {
            callback && callback();
            dlg.close();
        });
    },

    confirm: function (message, callback) {
        var height = 150 - 42 - 42 - 10;
        var dlg = this._show('dialog', {
            showMax: false,
            icon: 'fa fa-question-circle', title: Language.Confirm, width: 300, height: 150,
            content: '<div style="text-align:center;height:' + height + 'px"><div style="padding-top:15px;">' + message + '</div></div>',
            footer: '<button class="ok">' + Language.OK + '</button><span style="width:20px;display:inline-block;"></span><button class="cancel">' + Language.Cancel + '</button>'
        });
        dlg.layer.find('.dialog-footer .ok').click(function () {
            callback && callback();
            dlg.close();
        });
        dlg.layer.find('.dialog-footer .cancel').click(function () {
            dlg.close();
        });
    },

    //private
    _show: function (type, option) {
        var _this = this, index = _this.index++,
            maskId = 'mask' + index, layerId = 'layer' + index;
        $('<div class="mask">').attr('id', maskId).css({ zIndex: index }).appendTo($('body'));
        var layer = $('<div>').attr('id', layerId).addClass(type).css({ zIndex: index + 1 }).appendTo($('body'));
        var dlg = {
            index: index, layer: layer, close: function () {
                $('#' + maskId + ',#' + layerId).remove();
                _this.index--;
            }
        };

        function createMaximizeIcon(container) {
            $('<i class="fa fa-window-maximize maximize">')
                .data('isMax', false)
                .appendTo(container)
                .click(function () {
                    if ($(this).data('isMax')) {
                        $(this).data('isMax', false)
                            .removeClass('fa-window-restore')
                            .addClass('fa-window-maximize');
                        layer.removeClass('dialog-max').attr('style', $(this).data('layerStyle'));
                    } else {
                        $(this).data('isMax', true)
                            .data('layerStyle', layer.attr('style'))
                            .removeClass('fa-window-maximize')
                            .addClass('fa-window-restore');
                        layer.addClass('dialog-max').attr('style', '').css({ zIndex: index + 1 });
                    }
                });
        }

        function createCloseIcon(container) {
            $('<i class="fa fa-close close">')
                .appendTo(container)
                .click(function () {
                    dlg.close();
                    option.onClose && option.onClose();
                });
        }

        var div = {};
        function setHeadMouseEvent(header) {
            header.mousedown(function (e) {
                e.preventDefault();
                div.move = true;
                div.offset = [
                    e.clientX - parseFloat(layer.css('left')),
                    e.clientY - parseFloat(layer.css('top'))
                ];
            });
            $(document).mousemove(function (e) {
                e.preventDefault();
                if (div.move) {
                    var left = e.clientX - div.offset[0];
                    var top = e.clientY - div.offset[1];
                    layer.css({ left: left, top: top });
                }
            }).mouseup(function () {
                delete div.move;
            });
        }

        function createContent(body, page) {
            if (option.content) {
                if (page) {
                    body.css({ overflow: 'auto' });
                }
                if (typeof option.content === 'function') {
                    option.content(body);
                } else {
                    body.append(option.content);
                }
            } else if (option.url) {
                if (option.partial) {
                    if (page) {
                        body.css({ overflow: 'auto' });
                    }
                    body.load(option.url);
                } else {
                    if (!page) {
                        body.css({ padding: 0, overflow: 'hidden' });
                    }
                    $('<iframe frameborder="0">').attr('src', option.url).appendTo(body);
                }
            } else if (option.component) {
                var router = new Router(body);
                router.route(option);
            }
        }

        function createFooter(content) {
            if (option.footer) {
                $('<div class="dialog-footer">').html(option.footer).appendTo(content);
            } else if (option.buttons) {
                var footer = $('<div class="dialog-footer">').appendTo(content);
                $(option.buttons).each(function (i, b) {
                    $('<button class="ok">').append(b.text).on('click', function () {
                        b.handler && b.handler.call(this, dlg);
                    }).appendTo(footer);
                });
                $('<button class="cancel">' + Language.Cancel + '</button>').on('click', function () {
                    dlg.close();
                    option.onClose && option.onClose();
                }).appendTo(footer);
            } else {
                body.css({ bottom: 0 });
            }
        }

        if (type === 'dialog') {
            var width = option.width || 500;
            var height = option.height || 300;
            layer.css({
                width: width + 'px', height: height + 'px',
                marginTop: -(height / 2) + 'px', marginLeft: -(width / 2) + 'px'
            });

            var content = $('<div class="dialog-content">').appendTo(layer);
            //header
            if (option.title) {
                var icon = option.icon || 'fa fa-window-maximize';
                var header = $('<div class="dialog-header">')
                    .append('<i class="icon ' + icon + '">')
                    .append(option.title);
                setHeadMouseEvent(header);
                if (option.showMax) {
                    createMaximizeIcon(header);
                }
                createCloseIcon(header);
                content.append(header);
            } else if (option.showClose) {
                createCloseIcon(layer);
            }
            //body
            var body = $('<div class="dialog-body">').appendTo(content);
            if (!option.title) {
                body.css({ top: 0 });
            }
            createContent(body, false);
            //footer
            createFooter(content);
        } else {
            var content = $('<div class="page-content">').appendTo(layer);
            createCloseIcon(layer);
            createContent(content, true);
        }

        option.success && option.success();
        return dlg;
    }

};