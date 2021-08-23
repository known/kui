function App(id, option) {
    //fields
    var _option = option,
        _elem = $('#' + id),
        _topbar, _router, _tabbar,
        _this = this;

    //init
    _init();

    //properties
    this.elem = _elem;
    this.topbar = _topbar;
    this.router = _router;
    this.tabbar = _tabbar;
    this.user = {};

    //methods
    this.setTool = function (tool) {
        _topbar.setTool(tool);
    }

    this.setTabbar = function (data) {
        _tabbar.setData(data);
    }

    this.route = function (item) {
        _router.route(item);
    }

    this.loadUser = function (url, callback) {
        $.post(url, function (res) {
            _this.user = res.user;
            Utils.setUser(res.user);
            Utils.setCodes(res.codes);
            callback && callback(res);
        });
    }

    //private
    function _init() {
        _elem.html('');
        if (_option.showTopbar) {
            _topbar = new Topbar(_elem, {});
        }
        _router = new Router(_elem, { isTop: true });
        if (_option.showTabbar) {
            _tabbar = new Tabbar(_elem, {});
        }
    }
}

var app = new App('app', {
    showTopbar: true,
    showTabbar: true
});