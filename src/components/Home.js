function Home() {

    this.render = function (dom) {
        $('<h1>').html('Home').appendTo(dom);
        $('<div>').html('Welcome, ' + this.user.UserName).appendTo(dom);
        $('<div>').html('Logout').css({ cursor: 'pointer' }).appendTo(dom).on('click', function () {
            app.logout();
        });
    }
}