
//{ id, text, parentId?, href?, hrefTarget?, icon, iconCls, cls, expanded, children }

var Menu_Id = 1;

var MainMenu = function (element, options) {
    this.element = $(element);
    this.options = $.extend(true, {}, this.options, options);
    this.init();
};

MainMenu.prototype = {

    options: {
        data: null,
        itemclick: null
    },

    loadData: function (data) {
        this.options.data = data || [];
        this.refresh();
    },

    refresh: function () {
        this._render();
    },

    init: function () {
        var me = this,
            opt = me.options,
            el = me.element;

        //el.addClass('menu');

        me.loadData(opt.data);

        el.on('click', '.main-menu-title', function (event) {
            var el = $(event.currentTarget);

            var li = el.parent();

            var item = me.getItemByEvent(event);

            //alert(item);
            //me.toggleItem(item);

            li.toggleClass('open');

            if (opt.itemclick) opt.itemclick.call(me, item);

        });

    },

    _render: function () {
        var data = this.options.data || [];
        var html = this._renderItems(data, null);
        this.element.html(html);
    },

    _renderItems: function (items, parent) {
        var s = '<ul class="' + (parent ? "main-menu-submenu" : "main-menu") + '">';
        for (var i = 0, l = items.length; i < l; i++) {
            var item = items[i];
            s += this._renderItem(item);
        }
        s += '</ul>';
        return s;
    },

    _renderItem: function (item) {

        var me = this,
            hasChildren = item.children && item.children.length > 0;

        var s = '<li class="' + (hasChildren ? 'has-children' : '') + '">';        //class="main-menu-item" open, expanded?

        s += '<a class="main-menu-title" data-id="' + item.id + '" ';
        //        if (item.href) {
        //            s += 'href="' + item.href + '" target="' + (item.hrefTarget || '') + '"';
        //        }
        s += '>';


        if (item.image) {
            s += '<i class="main-menu-icon"><img src="' + item.image + '"/></i>';
        } else {
            s += '<i class="main-menu-icon fa ' + item.iconCls + '"></i>';
        }
        s += '<span class="main-menu-text">' + item.text + '</span>';

        if (hasChildren) {
            s += '<span class="main-menu-arrow fa"></span>';
        }

        s += '</a>';

        if (hasChildren) {
            s += me._renderItems(item.children, item);
        }

        s += '</li>';
        return s;
    },

    getItemByEvent: function (event) {
        var el = $(event.target).closest('.main-menu-title');
        var id = el.attr("data-id");
        return this.getItemById(id);
    },

    getItemById: function (id) {
        var me = this,
            idHash = me._idHash;

        if (!idHash) {
            idHash = me._idHash = {};
            function each(items) {
                for (var i = 0, l = items.length; i < l; i++) {
                    var item = items[i];
                    if (item.children) each(item.children);
                    idHash[item.id] = item;
                }
            }
            each(me.options.data);
        }

        return me._idHash[id];
    }

};

var MainMenuTip = function (menu) {
    var template = '<div class="tooltip right menutip in"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>';
    var tip = $(template).appendTo(document.body);
    tip.hide();

    menu.element.on("mouseenter", ".main-menu-title", function (event) {
        if (!$("body").hasClass("compact")) return;

        var jq = $(event.currentTarget);
        var offset = jq.offset(),
            width = jq.outerWidth(),
            height = jq.outerHeight(),
            text = jq.text();

        tip.find(".tooltip-inner").html(text);
        tip.show();

        var tipWidth = tip.outerWidth(),
            tipHeight = tip.outerHeight();

        tip.css({ top: offset.top + height / 2 - tipHeight / 2, left: offset.left + width });

    });
    menu.element.on("mouseleave", ".main-menu-title", function (event) {
        tip.hide();
    });

};

$(function () {
    //menu
    var menu = new MainMenu("#mainMenu", {
        itemclick: function (item) {
            if (!item.children) {
                $('#content').attr('src', item.url);
                $('#mainTabs').tabs('add', {
                    title: item.text,
                    selected: true,
                    iconCls: item.iconCls,
                    href: item.url
                });
            }
        }
    });

    $(".sidebar").mCustomScrollbar({ autoHideScrollbar: true });

    new MainMenuTip(menu);

    $.ajax({
        url: "data/menu.json",
        success: function (data) {
            menu.loadData(data);
        }
    });

    //toggle
    $("#toggle, .sidebar-toggle").click(function () {
        $('body').toggleClass('compact');
    });

    //dropdown
    $(".dropdown-toggle").click(function (event) {
        $(this).parent().addClass("open");
        return false;
    });

    $(document).click(function (event) {
        $(".dropdown").removeClass("open");
    });
});