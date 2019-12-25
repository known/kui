(function ($) {

    function getDialogGUID() {
        return 'dialog' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getDialogObject(cls, id) {
        var obj = null;
        $(cls).each(function () {
            if ($(this).data('dialogId') === id) {
                obj = $(this);
                return false;
            }
        });

        return obj;
    }

    function getLayerIndex() {
        var index = 0;
        $(document.body).children().each(function () {
            if (parseInt($(this).css('z-index')) > index) {
                index = parseInt($(this).css('z-index'));
            }
        });
        if (index === 0) {
            index = 9999;
        }
        return index;
    }

    function showloading(con) {
        var bg = $('<div class="dialogLoadingBg"></div>');
        var obj = $('<div class="dialogLoading"></div>');
        con.append(bg).append(obj);
    }

    function resizeDialog(el, obj) {
        var els = $(obj), x = y = 0;
        var shadow = $("<div style=\"position:fixed;width:" + obj.outerWidth() + "px;height:" + obj.outerHeight() + "px;z-index:" + (parseInt($(obj).css("z-index")) + 1) + ";left:" + $(obj).css("left") + ";top:" + $(obj).css("top") + ";opacity:0.6; filter:alpha(opacity=60);background-color:#fff;border:1px solid #999;cursor: nwse-resize;\"></div>");
        $(el).mousedown(function (e) {
            if (obj.outerWidth() < $(window).width()) {
                shadow.css({ "width": $(obj).outerWidth() + "px", "height": $(obj).outerHeight() + "px", "z-index": (parseInt($(obj).css("z-index")) + 1), "left": $(obj).css("left"), "top": $(obj).css("top") });
                shadow.appendTo('body'); x = e.clientX - els.outerWidth(), y = e.clientY - els.outerHeight();
                el.setCapture ? (el.setCapture(), el.onmousemove = function (ev) { mouseMove(ev || event) }, el.onmouseup = mouseUp) : ($(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp));
                e.preventDefault();
            }
        });
        function mouseMove(e) {
            shadow.width(((e.clientX - x) < 100) ? '100' : (($(window).width() - 5) < (e.clientX - x) ? ($(window).width() - 5) : (e.clientX - x)) + 'px');
            shadow.height(((e.clientY - y) < 100) ? '100' : (($(window).height() - 5) < (e.clientY - y) ? ($(window).height() - 5) : (e.clientY - y)) + 'px');
        }
        function mouseUp(e) {
            var bw = parseInt(els.css("border-left-width")); 
            var bh = parseInt(els.css("border-bottom-width"));
            var cw = shadow.width();
            var ch = shadow.height();
            els.animate({ 'width': cw, 'height': ch }, function () {
                els.children(".window-content").css({ 
                    'height': ch - parseInt(els.children(".window-title").height()) 
                });
                if ($(this).children(".window-content").children("iframe").length > 0) {
                    els.children(".window-content").children("iframe").css({ "height": ch - parseInt(els.children(".window-title").height()), "width": "100%" });
                }
                shadow.remove();
            });
            el.releaseCapture
                ? (el.releaseCapture(), el.onmousemove = el.onmouseup = null)
                : ($(document).unbind("mousemove", mouseMove).unbind("mouseup", mouseUp));
        }
    }

    function dragDialog(el, obj) {

    }

    $.Dialog = {

        show: function (option) {
            var opts = $.extend({}, {
                content: null, url: null, title: '',
                width: 600, height: 350,
                maximize: false, scrollbar: { x: false, y: true },
                operate: {
                    close: true, max: true, refresh: false, newWindow: false, resize: true
                },
                callback: null
            }, option);

            var win = {
                width: $(window).width(), height: $(window).height()
            };
            if (opts.width.toString().indexOf("%") > -1) {
                opts.width = win.width * (parseFloat(opts.width.replace(/%/g, '')) / 100);
            }
            if (opts.height.toString().indexOf("%") > -1) {
                opts.height = win.height * (parseFloat(opts.height.replace(/%/g, '')) / 100);
            } else {
                opts.height = parseFloat(opts.height);
            }

            var id = getDialogGUID();
            var bg = $('<div class="dialogBg"></div>');
            var dlg = $('<div class="dialog"></div>').css({
                width: opts.width, height: opts.height,
                left: (win.width - opts.width) / 2,
                top: win.height > opts.height ? (win.height - opts.height) / 2 : 0
            });
            var title = $('<div class="dialogTitle"></div>').html(opts.title);
            var con = $('<div class="dialogContent"></div>');
            if (opts.content !== null) {
                con.append(opts.content);
            } else if (opts.url !== null) {
                showloading(dlg);
                dlg.on('animationend.loadinit webkitAnimationEnd.loadinit', function () {
                    var thisobj = $(this);
                    dlg.find('.dialogContent').css('overflow', 'hidden');
                    var iframe = $('<iframe src="' + opts.url + '"></iframe>');
                    iframe.load(function () {
                        thisobj.find('.dialogLoadingBg,.dialogLoading')
                            .animate({ 'opacity': '0' }, 300, 'linear', function () { $(this).remove(); });
                    });
                    con.append(iframe);
                });
            }
            dlg.append(title).append(con);

            if (opts.operate.resize) {
                var resize = $('<div class="dialogResize"></div>');
                dlg.append(resize);
                resizeDialog(resize, dlg);
            }

            var operate = $('<ul class="dialogOperate"></ul>');
            var btnClose = null, btnMax = null, btnNewWindow = null, btnRefresh = null;
            if (opts.operate.close) {
                btnClose = $('<li class="close"></li>');
                operate.append(btnClose);
            }
            if (opts.operate.max) {
                btnMax = $('<li class="max"></li>');
                operate.append(btnMax);
                if (opts.maximize) {
                    dlg.data('dialogState', 'max');
                    var width = win.width * 0.7, height = win.height * 0.7;
                    dlg.data('dialogSize', {
                        width: width, height: height,
                        left: (win.width - width) / 2, top: (win.height - height) / 2
                    });
                    dlg.css({
                        width: win.width, height: win.height,
                        left: 0, top: 0
                    }).find('.max').removeClass('max').addClass('normal');
                } else {
                    dlg.data('dialogState', 'normal');
                }
            }
            if (opts.operate.refresh && opts.url) {
                btnRefresh = $('<li class="refresh"></li>');
                operate.append(btnRefresh);
            }
            if (opts.operate.newWindow && opts.url) {
                btnNewWindow = $('<li class="newWindow"></li>');
                operate.append(btnNewWindow);
            }
            dlg.append(operate);

            var zindex = getLayerIndex();
            dlg.data('dialogId', id).addClass("dialogMarchIn").css("z-index", zindex);
            bg.data('dialogId', id).addClass("dialogBgMotionIn").css("z-index", zindex);
            $(document.body).append(bg).append(dlg);
            dragDialog(title, dlg);

            if (btnClose) {
                btnClose.click({ id: id }, function (event) {
                    $.Dialog.close(event.data.id, opts.callback);
                });
            }
            if (btnMax) {
                btnMax.click({ id: id }, function (event) {
                    $.Dialog.maximize(event.data.id);
                });
            }
            if (btnRefresh) {
                btnRefresh.click({ obj: dlg }, function (event) {
                    var dlgobj = event.data.obj;
                    if (dlgobj.find('iframe').length > 0) {
                        showloading(dlgobj);
                        dlgobj.find('iframe').attr('src', dlgobj.find('iframe').attr('src'));
                    }
                });
            }
            if (btnNewWindow) {
                btnNewWindow.click({ obj: dlg }, function (event) {
                    var dlgobj = event.data.obj;
                    if (dlgobj.find('iframe').length > 0) {
                        window.open(dlgobj.find('iframe').attr('src'), '_blank');
                    }
                });
            }

            return id;
        },

        close: function (id, callback) {
            if (!id) return;

            var obj = getDialogObject('.dialog', id),
                bg = getDialogObject('.dialogBg', id);

            obj.removeClass('dialogMarchIn').addClass('dialogMarchOut');
            obj.on('animationend.close webkitAnimationEnd.close', function () {
                $(this).remove(); callback && callback();
            });

            bg.removeClass('dialogBgMotionIn').addClass('dialogBgMotionOut');
            bg.on('animationend.close webkitAnimationEnd.close', function () {
                $(this).remove();
            });
        },

        maximize: function (id) {
            if (!id) return;

            var obj = getDialogObject('.dialog', id);
            if (!obj) return;

            if (obj.data('dialogState') === 'normal') {
                obj.data('dialogSize', {
                    width: obj.width(), height: obj.height(),
                    left: obj.css('left'), top: obj.css('top')
                });
                obj.animate({
                    width: $(window).width(), height: $(window).height(),
                    left: 0, top: 0
                }, 350, function () {
                    obj.data('dialogState', 'max');
                    obj.find('.max').removeClass('max').addClass('normal');
                });
            } else {
                obj.animate(obj.data('dialogSize'), 350, function () {
                    obj.data('dialogState', 'normal');
                    obj.find('.normal').removeClass('normal').addClass('max');
                });
            }
        }

    };

})(jQuery);

(function (a) {
    a(function () {
        a(document.body).append(a("<style>.NH-Drag{-moz-user-select: -moz-none;-moz-user-select: none;-o-user-select: none;-khtml-user-select: none;-webkit-user-select: none;-ms-user-select: none;user-select: none}</style>"))
    });
    a.fn.NHDrag = function (j) {
        var f = a(this);
        var g = { bydragobj: f, isTransparent: true, };
        var k = a.extend({}, a.fn.NHDrag.defaultparam, j);
        k = a.extend({}, g, k);
        var i = false; var d, e;
        var h = 0, m = 0, l = 0, c = 0;
        a(this).bind({
            "click.NHDrag": function (n) { },
            "mousedown.NHDrag": function (n) {
                i = true;
                k = a.extend({}, a.fn.NHDrag.defaultparam, j);
                k = a.extend({}, g, k);
                switch (k.bydragobj.css("position")) {
                    case "absolute":
                    default:
                        h = k.upper.left == null ? -k.bydragobj.outerWidth() / 2 : k.upper.left;
                        m = k.upper.top == null ? 0 : k.upper.top; l = k.upper.right == null ? (document.body.scrollWidth + k.bydragobj.outerWidth() / 2) : k.upper.right;
                        c = k.upper.bottom == null ? (document.body.scrollHeight - k.bydragobj.outerHeight() / 2) : k.upper.bottom;
                        break;
                    case "fixed":
                        h = k.upper.left == null ? -k.bydragobj.outerWidth() / 2 : k.upper.left;
                        m = k.upper.top == null ? 0 : k.upper.top;
                        l = k.upper.right == null ? (a(window).width() - k.bydragobj.outerWidth() / 2) : k.upper.right;
                        c = k.upper.bottom == null ? (a(window).height() - k.bydragobj.outerHeight() / 2) : k.upper.bottom;
                        break;
                }
                d = n.pageX - parseInt(k.bydragobj.css("left") == "auto" ? 0 : k.bydragobj.css("left"));
                e = n.pageY - parseInt(k.bydragobj.css("top") == "auto" ? 0 : k.bydragobj.css("top"));
                if (k.isTransparent) {
                    k.bydragobj.fadeTo(20, 0.5)
                }
                if (k.bydragobj.find("iframe").length > 0) {
                    k.bydragobj.find("iframe").hide()
                }
                a(document.body).attr("unselectable", "on").addClass("NH-Drag");
                a(document).bind({
                    "mousemove.NHDrag": function (o) {
                        if (i) {
                            k.bydragobj.css({
                                left: (o.pageX - d) <= h ? h : ((o.pageX - d) >= l) ? l : o.pageX - d,
                                top: (o.pageY - e) <= m ? m : ((o.pageY - e) >= c ? c : (o.pageY - e))
                            })
                        }
                    },
                    "mouseup.NHDrag": function (o) {
                        k.bydragobj.find("iframe").show();
                        i = false;
                        k.bydragobj.fadeTo("fast", 1);
                        a(document).unbind("mousemove.NHDrag mouseup.NHDrag selectstart.NHDrag");
                        a(document.body).removeClass("NH-Drag").removeAttr("unselectable");
                        a("#isfloat").html(a(document.body).css("user-select"))
                    },
                    "selectstart.NHDrag": function (o) {
                        return false
                    }
                });
                n.preventDefault();
                b(n)
            }
        })
    };
    a.fn.NHDrag.defaultparam = {
        upper: { left: null, right: null, top: null, bottom: null }
    };
    function b(c) {
        if (c && c.stopPropagation) {
            c.stopPropagation()
        } else {
            window.event.cancelBubble = true
        }
    }
})(jQuery);