function App(id, config) {
    //fields
    var _elem = $('#' + id),
        _router = new Router(_elem, {
            before: function (item) {
                var component = item.component;
                if (!(component instanceof Login) && !component.user) {
                    _showLogin()
                    return false;
                }
                return true;
            },
            after: function (item) {

            }
        });

    //properties
    this.config = config;

    //methods
    this.route = function (item) {
        _route(item);
    }

    this.admin = function (user) {
        _setUser(user);
        _showAdmin();
    }

    this.login = function () {
        _showLogin();
    }

    this.logout = function () {
        _setUser(null);
        _showLogin();
    }

    //private
    function _route(item) {
        item.component.user = _getUser();
        _router.route(item);
    }

    function _showLogin() {
        _route({ component: new Login(config) });
    }

    function _showAdmin() {
        _route({ component: new Admin() });
    }

    const Key_User = 'Known_User';

    function _getUser() {
        var value = sessionStorage.getItem(Key_User);
        if (!value || value === 'undefined')
            return null;

        var user = JSON.parse(value);
        if (!user.AppName) {
            user.AppName = config.AppName;
        }
        return user;
    }

    function _setUser(user) {
        if (!user) {
            sessionStorage.removeItem(Key_User);
        } else {
            sessionStorage.setItem(Key_User, JSON.stringify(user));
        }
    }

    _showAdmin();
}

function log(obj) {
    console.log(obj);
}

var app = new App('app', {
    AppName: 'Known UI'
});