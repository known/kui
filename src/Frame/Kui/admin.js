function getCurTab() {
    return Admin.currentTab;
}

var Admin = {

    //field
    option: null,
    menuList: [],
    menuTree: [],
    currentSys: null,
    currentTab: null,
    injects: [],
    cacheHelp: {},

    //public
    show: function (option) {
        if (Utils.checkMobile()) {
            location = baseUrl + '/app.html';
            return;
        }

        if (option.multiTab) {
            AdminTab.bindContextMenu();
        }

        this.option = option;
        this._setLanguage();
        this._bindAction();
        var _this = this;
        $.get(option.GetUserData, function (result) {
            if (result.user) {
                if (result.user.UserName === 'System') {
                    $('#topRight .site').show();
                }
                $('#userName').html(result.user.Name);
                _this.setUserAvatar(result.user.AvatarUrl);
                Utils.setUser(result.user);
                Utils.setCodes(result.codes);

                for (var i = 0; i < result.menus.length; i++) {
                    var menu = result.menus[i];
                    if (menu.type !== 'button') {
                        _this.menuList.push($.extend({}, menu));
                    }
                }

                _this.menuTree = Utils.list2Tree(result.menus, result.user.AppId);
                if (_this.menuTree.length) {
                    _this.currentSys = _this.menuTree[0];
                    if (_this.menuTree.length > 1) {
                        _this._renderTopMenu(_this.menuTree);
                        _this._renderLeftMenu(_this.currentSys);
                    } else if (result.user.AppTopMenu) {
                        //_this.currentSys = _this.menuTree[0].children[0];
                        _this._renderTopMenu(_this.menuTree[0].children);
                        _this._renderLeftMenu(_this.menuTree[0].children[0]);
                    } else {
                        _this._renderLeftMenu(_this.currentSys);
                    }
                    _this._showHomePage(_this.currentSys);
                }

                _this._checkValidDate(result.user);
            }
            $('.loader').fadeOut();
        });
    },

    setUserAvatar: function (url) {
        $('#userAvatar').attr('src', baseUrl + url);
    },

    inject: function (js) {
        if (this.injects.indexOf(js) === -1) {
            this.injects.push(js);
            var script = document.createElement('script');
            script.src = js;
            $('script[src*="static/"]').last().after($(script));
        }
    },

    showPage: function (page) {
        if (!page)
            return;

        var _this = this;
        var app = (_this.currentSys.app || '').toLowerCase();
        var sys = (_this.currentSys.code || '').toLowerCase();
        if (page.isTop && !page.url) {
            page.url = '/pages/page.html?m=Dashboard';
            if (page.type === 'page') {
                page.url = '/pages/page.html?a=' + app + '&s=' + sys + '&m=' + page.code + 'Dashboard';
            }
        } else if (page.type === 'page') {
            page.url = '/pages/page.html?a=' + app + '&s=' + sys + '&m=' + page.code;
        }

        if (this.option.multiTab) {
            AdminTab.showTab(page);
        } else {
            var breadcrumb = $('.tabs-header').html('');
            $('<i class="fa fa-home" style="margin-left:10px;">').appendTo(breadcrumb);
            if (!page.isTop) {
                $('<span class="link">' + Language.HomePage + '</span>').on('click', function () {
                    _this._showHomePage(_this.currentSys);
                }).appendTo(breadcrumb);
                breadcrumb.append(' / ' + page.name);
            } else {
                breadcrumb.append(Language.HomePage);
            }

            var iframe = $('.layout-body iframe')
            if (!iframe.length) {
                iframe = $('<iframe frameborder="0">').appendTo($('.layout-body'));
            }
            iframe.attr('title', page.title);
            _this.currentTab = page;
            _this._loadFrame(iframe, page.url);
        }

        _this._loadHelp(page.hid);
    },

    //private
    _loadFrame: function (iframe, url) {
        if (!url)
            return;

        var lay = Layer.loading(Language.Loading + '......');
        iframe.attr('src', baseUrl + url).on('load', function () { lay.close(); });
    },

    _loadHelp: function (hid) {
        var help = $('.layout-help .content');
        if (!help.length)
            return;

        var _this = this;
        var content = _this.cacheHelp[hid];
        if (content) {
            help.html(content);
        } else {
            help.html(Language.Loading + '......');
            $.get(_this.option.Help + '?hid=' + hid, function (res) {
                _this.cacheHelp[hid] = res;
                help.html(res);
            });
        }
    },

    _setLanguage: function () {
        $('[action="refresh"]').attr('title', Language.RefreshPage);
        $('[action="share"]').attr('title', Language.ShareSystem);
        $('[action="feedback"]').attr('title', Language.Feedback);
        $('[action="fullScreen"]').attr('title', Language.FullScreen);
        $('[action="shortcut"]').attr('title', Language.Shortcut);
        $('[action="site"]').attr('title', Language.SiteSetting);
        $('[action="toggle"]').attr('title', Language.Collapse);
        $('[action="help"]').attr('title', Language.HelpDocument);

        $('#UserCenter').html(Language.UserCenter);
        $('#SafeLogout').html(Language.SafeLogout);
        $('#TechSupport').html(Language.TechSupport);
    },

    _bindAction: function () {
        var _this = this;
        var action = {
            refresh: function () {
                if (_this.option.multiTab) {
                    AdminTab.refreshTab();
                } else {
                    var iframe = $('.layout-body iframe');
                    var url = iframe.attr('src');
                    _this._loadFrame(iframe, url);
                }
            },
            share: function () {
                alert('share')
            },
            feedback: function () {
                var formFeed;
                Layer.open({
                    title: Language.Feedback, width: 650, height: 450,
                    content: '<div id="formFeedback" class="form"></div>',
                    success: function () {
                        formFeed = new Form('Feedback', {
                            fields: [
                                { field: 'AppId', type: 'hidden' },
                                { field: 'FeedName', type: 'hidden' },
                                { field: 'FeedById', type: 'hidden' },
                                { title: Language.FeedBy, field: 'FeedBy', type: 'text', required: true, readonly: true },
                                { title: Language.ContactMode, field: 'FeedPhone', type: 'text', required: true },
                                { title: Language.FeedContent, field: 'Content', type: 'textarea', required: true, lineBlock: true, inputStyle: 'height:230px;' },
                                { title: Language.Attachment, field: 'File', type: 'file', lineBlock: true }
                            ]
                        });
                        var user = Utils.getUser();
                        formFeed.setData({
                            AppId: user.AppId, FeedName: user.CompName,
                            FeedById: user.UserName, FeedBy: user.Name, FeedPhone: user.Mobile
                        });
                    },
                    buttons: [{
                        text: Language.Send, icon: 'fa fa-send-o', handler: function (e) {
                            if (!formFeed.validate())
                                return;

                            var data = formFeed.getData();
                            Ajax.upload('File', _this.option.Feedback, data, function () {
                                e.close();
                            });
                        }
                    }]
                });
            },
            fullScreen: function () {
                var el = document.documentElement;
                var rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;
                if (rfs) {
                    rfs.call(el);
                } else if (typeof window.ActiveXObject !== 'undefined') {
                    //for IE
                    var wscript = new ActiveXObject('WScript.Shell');
                    if (wscript !== null) {
                        wscript.SendKeys('{F11}');
                    }
                }
                $(this).attr('action', 'exitScreen').html('<i class="fa fa-arrows"></i>');
            },
            exitScreen: function () {
                var el = document;
                var cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.exitFullScreen;
                if (cfs) {
                    cfs.call(el);
                } else if (typeof window.ActiveXObject !== 'undefined') {
                    //for IE
                    var wscript = new ActiveXObject('WScript.Shell');
                    if (wscript !== null) {
                        wscript.SendKeys('{F11}');
                    }
                }
                $(this).attr('action', 'fullScreen').html('<i class="fa fa-arrows-alt"></i>');
            },
            shortcut: function () {
            },
            site: function () {
                _this.showPage({
                    id: 'site',
                    title: $(this).attr('title'),
                    icon: $(this).find('i').attr('class'),
                    type: 'page',
                    code: 'SysSite'
                });
            },
            userInfo: function () {
                _this.showPage({
                    id: 'userInfo',
                    title: $(this).text(),
                    icon: $(this).find('i').attr('class'),
                    type: 'page',
                    code: 'SysUserInfo'
                });
            },
            logout: function () {
                Layer.confirm(Language.LogoutConfirm, function () {
                    $.post(_this.option.SignOut, function (result) {
                        Utils.setUser(null);
                        Utils.setCodes(null);
                        window.location = baseUrl + '/login';
                    });
                });
            },
            toggle: function () {
                var status = $(this).data('status');
                if (status && status === '1') {
                    $(this).data('status', '0').addClass('fa-dedent').removeClass('fa-indent');
                    $('body').removeClass('layout-mini');
                } else {
                    $(this).data('status', '1').addClass('fa-indent').removeClass('fa-dedent');
                    $('body').addClass('layout-mini');
                    $('.nav-tree i').each(function (i, e) {
                        var title = $(e).next().text();
                        $(e).attr('title', title);
                    });
                }
            },
            help: function () {
                var help = $('.layout-help'), body = $('.layout-body');
                if (!help.length) {
                    body.css({ right: '400px' });
                    help = $('<div class="layout-help">').insertAfter(body);
                    $('<span class="fa fa-close close">')
                        .on('click', function () {
                            body.css({ right: 0 });
                            help.remove();
                        })
                        .appendTo(help);
                    $('<div class="title">').html('<i class="fa fa-question-circle-o"></i>' + Language.HelpDocument).appendTo(help);
                    $('<div class="content">').appendTo(help);
                }

                _this._loadHelp(_this.currentTab.hid);
            }
        };

        $('[action]').on('click', function () {
            var othis = $(this), type = othis.attr('action');
            action[type] ? action[type].call(this, othis) : '';
        });
    },

    _showHomePage: function (page) {
        page.isTop = true;
        this.showPage(page);
    },

    _renderTopMenu: function (menus) {
        var _this = this, topMenu = $('#topMenu').html('');
        for (var i = 0; i < menus.length; i++) {
            $('<li>')
                .addClass('nav-item' + (i === 0 ? ' active' : ''))
                .data('page', menus[i])
                .html(menus[i].name)
                .on('click', function () {
                    topMenu.find('li').removeClass('active');
                    $(this).addClass('active');
                    var menu = $(this).data('page');
                    //_this.currentSys = menu;
                    if (menu.url) {
                        _this._showHomePage(menu);
                    }
                    _this._renderLeftMenu(menu);
                })
                .appendTo(topMenu);
        }
    },

    _renderLeftMenu: function (menu) {
        var _this = this, leftMenu = $('#leftMenu').html(''),
            activeItem = function (item) {
                leftMenu.find('.nav-title,.nav-child dd').removeClass('active');
                item.addClass('active');
            },
            activeChild = function (item, show) {
                if (show) {
                    item.data('show', '1');
                    item.next().show();
                    item.find('span.fa').removeClass('fa-chevron-down').addClass('fa-chevron-up');
                } else {
                    item.data('show', '0');
                    item.next().hide();
                    item.find('span.fa').removeClass('fa-chevron-up').addClass('fa-chevron-down');
                }
            };
        var menus = menu.children || [];
        for (var i = 0; i < menus.length; i++) {
            var li = $('<li>').addClass('nav-item').appendTo(leftMenu);
            var tl = $('<div>').addClass('nav-title')
                .append('<i class="' + menus[i].icon + '">')
                .append('<span>' + menus[i].name + '</span>')
                .data('page', menus[i])
                .data('show', '0')
                .appendTo(li)
                .on('click', function () {
                    var $this = $(this);
                    activeItem($this);
                    var page = $this.data('page');
                    if (page.url || page.type ==='page') {
                        _this.showPage(page);
                    } else {
                        leftMenu.find('.nav-title').not($this).each(function (i, elem) {
                            activeChild($(elem), false);
                        });
                        activeChild($this, $this.data('show') === '0');
                    }
                });
            if (menus[i].children && menus[i].children.length) {
                var childs = menus[i].children.filter(function (m) { return m.type !== 'button'; });
                if (childs && childs.length) {
                    tl.append('<span class="fa fa-chevron-down"></span>');
                    var dl = $('<dl>').addClass('nav-child').appendTo(li);
                    $(childs).each(function (ci, cd) {
                        var dd = $('<dd>')
                            .append('<i class="' + cd.icon + '">')
                            .append('<span>' + cd.name + '</span>')
                            .data('page', cd)
                            .appendTo(dl)
                            .on('click', function () {
                                activeItem($(this));
                                _this.showPage($(this).data('page'));
                            });
                    });
                }
            }
        }
    },

    _checkValidDate: function (user) {
        var validDate = user.AppValidDate;
        if (validDate === '永久')
            return;

        if (validDate === '') {
            Layer.open({
                width: 300, height: 100,
                content: '<div class="alert-content center">' + Language.ProductNotAuthorized + '</div>'
            });
        } else {
            var date = Date.parse(validDate);
            var now = new Date();
            var diff = parseInt((date - now) / (1000 * 60 * 60 * 24)) + 1;
            if (diff <= 30) {
                var content = '<div id="divValidDate" class="layout-alert">';
                var tip = Utils.format(Language.ProductValidDateTips, diff);
                content += '<div class="alert-content">' + tip + '</div>';
                if (user.AppYun) {
                    content += '<div class="alert-toolbar"><button class="ok" style="margin-right:20px;">' + Language.OK + '</button><button class="cancel">' + Language.Close + '</button></div>';
                } else {
                    content += '<div class="alert-toolbar"><button class="active" style="margin-right:20px;">' + Language.GoToActivate + '</button><button class="cancel">' + Language.Close + '</button></div>';
                }
                content += '</div>';
                var dlg = Layer.open({
                    width: 450, height: 200, content: content,
                    success: function () {
                        $('#divValidDate button.active').click(function () { location = baseUrl + '/active'; });
                        $('#divValidDate button.ok,#divValidDate button.cancel').click(function () { dlg.close(); });
                    }
                });
            }
        }
    }

};

var AdminTab = {

    showTab: function (page) {
        var _this = this;
        var id = 'tab-' + page.id;
        var tab = $('#' + id);
        if (!tab.length) {
            var icon = page.isTop ? 'fa fa-home' : page.icon;
            var title = page.isTop ? Language.HomePage : page.title;
            var item = $('<div id="h' + id + '" class="tabs-header-item">')
                .data('data', page)
                .append('<i class="icon ' + icon + '">')
                .append('<span class="title">' + title + '</span>')
                .on('click', function () { _this.activeTab($(this).data('data')); })
                .appendTo($('.tabs-header'));

            if (title !== Language.HomePage) {
                $('<i class="close fa fa-close">')
                    .data('data', page)
                    .on('click', function () { _this.closePage($(this).data('data')); })
                    .appendTo(item);
            }

            tab = $('<div id="' + id + '" class="tabs-body-item">').appendTo($('.layout-body'));
            var iframe = $('<iframe frameborder="0">').attr('title', page.title).appendTo(tab);
            Admin._loadFrame(iframe, page.url);
        }
        _this.activeTab(page);
    },

    activeTab: function (page) {
        Admin.currentTab = page;
        $('.tabs-header-item,.tabs-body-item').removeClass('active');
        $('#htab-' + page.id + ',#tab-' + page.id).addClass('active');
    },

    refreshTab: function () {
        var id = Admin.currentTab.id;
        var iframe = $('#tab-' + id + ' iframe');
        var url = iframe.attr('src');
        Admin._loadFrame(iframe, url);
    },

    closePage: function (page) {
        var htab = $('#htab-' + page.id);
        var isActive = htab.hasClass('active');
        if (isActive) {
            var next = htab.next();
            if (!next.length) {
                next = htab.prev();
            }
            if (next.length) {
                this.activeTab(next.data('data'));
            }
        }
        htab.remove();
        $('#tab-' + page.id).remove();
    },

    closeAll: function () {
        var _this = this;
        $('.tabs-header-item').each(function (i, tab) {
            var page = $(tab).data('data');
            if ($(tab).text() === Language.HomePage) {
                _this.activeTab(page);
            } else {
                $('#htab-' + page.id + ',#tab-' + page.id).remove();
            }
        });
    },

    closeOne: function (id) {
        var title = $('#' + id).text();
        if (title === Language.HomePage)
            return;

        this.closePage($('#' + id).data('data'));
    },

    closeOther: function (id) {
        var _this = this;
        $('.tabs-header-item').each(function (i, tab) {
            if ($(tab).text() !== Language.HomePage) {
                var page = $(tab).data('data');
                if ($(tab).attr('id') === id) {
                    _this.activeTab(page);
                } else {
                    $('#htab-' + page.id + ',#tab-' + page.id).remove();
                }
            }
        });
    },

    bindContextMenu: function () {
        var _this = this, ctxMenu;
        $(document).click(function () {
            if (ctxMenu && ctxMenu.length) {
                ctxMenu.remove();
            }
        });

        $('.tabs-header').contextmenu(function (e) {
            e.preventDefault();
            var items = [];
            if (e.target.className === 'tabs-header') {
                items.push({ Code: 'closeAll', Icon: 'fa fa-times', Name: Language.CloseAll });
            } else if (e.target.className === 'title') {
                items.push({ Code: 'closeAll', Icon: 'fa fa-times', Name: Language.CloseAll });
                items.push({ Code: 'closeOne', Icon: 'fa fa-times-circle-o', Name: Language.CloseOne });
                items.push({ Code: 'closeOther', Icon: 'fa fa-times-circle', Name: Language.CloseOther });
            }

            if (items.length) {
                ctxMenu = $('.ctxmCloseTab').html('');
                if (!ctxMenu.length) {
                    ctxMenu = $('<ul class="contextmenu ctxmCloseTab">').appendTo($('body'));
                }
                ctxMenu.css({ top: e.pageY + 'px', left: e.pageX + 'px' });

                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    $('<li>').data('code', item.Code)
                        .append('<i class="' + item.Icon + '">')
                        .append('<span>' + item.Name + '</span>')
                        .on('click', function () {
                            _this[$(this).data('code')].call(_this, e.target.parentNode.id);
                            ctxMenu.remove();
                        })
                        .appendTo(ctxMenu);
                }
            }
        });
    }

};

var ExtForm = window.ExtForm = {};

window.Admin = Admin;

$(document).contextmenu(function (e) {
    e.preventDefault();
});
$(function () {
    if (!window.localStorage) {
        var content = '<div id="h5NotSupport" class="layout-alert">';
        content += '<div class="alert-content">' + Language.BrowserTips + '</div>';
        content += '<div class="alert-toolbar"><button class="ok" style="margin-right:20px;">' + Language.IKnow + '</button><button class="cancel">' + Language.GoToDownload + '</button></div>';
        content += '</div>';
        var dlg = Layer.open({
            width: 450, height: 250, content: content,
            success: function () {
                $('#h5NotSupport button.ok').click(function () { dlg.close(); });
                $('#h5NotSupport button.cancel').click(function () {
                    window.open('https://www.baidu.com/s?wd=chrome');
                });
            }
        });
    }

    Admin.show({
        multiTab: true,
        Feedback: baseUrl + '/System/Feedback',
        Help: baseUrl + '/Home/Help',
        GetUserData: baseUrl + '/data/UserData.json',
        SignOut: baseUrl + '/signout'
    });
});