function getCurTab() {
    return top.Admin.currentTab;
}

function showTabPage(page) {
    top.Admin.showPage(page);
}

function showTabPageByCode(code) {
    var page = top.Admin.menuList.filter(function (d) { return d.code === code; });
    if (page.length) {
        top.Admin.showPage(page[0]);
    }
}

function App(id, option) {
    //fields
    var _elem = $('#' + id),
        _option = option,
        _router;

    //init
    _init();

    //properties
    this.elem = _elem;
    this.router = _router;
    this.user = {};

    //methods
    this.route = function (item) {
        _router.route(item);
    }

    this.render = function () {
        var m = Utils.getUrlParam('m');
        if (!Page[m]) {
            _elem.html('<div class="content">' + m + Language.NotExist + '！</div>');
        } else {
            _router.route(Page[m]);
            setTimeout(function () {
                Page.complete();
                BizHistory.init();
            }, 10);
        }
    }

    //private
    function _init() {
        _router = new Router(_elem, { isTop: true, multiNode: true });
    }
}

var app = new App('app', {});

$(document).contextmenu(function (e) {
    e.preventDefault();
});
$(function () {
    Page.complete();
});