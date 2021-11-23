function Admin() {
    //fields
    var header = new Header();
    var sideBar = new SideBar();
    var content = new Content();

    //methods
    this.render = function (dom) {
        dom.addClass('dark');
        header.render(dom);
        sideBar.render(dom);
        content.render(dom);
    }

    this.mounted = function () {
        var user = this.user;
        header.load(user);
        sideBar.load(user);
    }

    //private
    function Header() {
        var elmTitle, elmUser;

        this.render = function (dom) {
            var elem = $('<div>').addClass('layout-header').appendTo(dom);
            elmTitle = $('<h1>').appendTo(elem);
            elmUser = $('<div>').appendTo(elem);
            $('<div>').html('Logout').css({ cursor: 'pointer' }).appendTo(elem).on('click', function () {
                app.logout();
            });
        }

        this.load = function (user) {
            elmTitle.html(user.AppName);
            elmUser.html('Welcome, ' + user.UserName);
        }
    }

    function SideBar() {
        this.render = function (dom) {
            var elem = $('<div>').addClass('layout-side').appendTo(dom);
        }

        this.load = function (user) {
        }
    }

    function Content() {
        this.render = function (dom) {
            var elem = $('<div>').addClass('layout-body').appendTo(dom);
        }
    }
}