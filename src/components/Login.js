function Login(config) {
    //fields
    var form = new Form({
        columns: [
            { field: 'UserName', type: 'text', icon: 'fa fa-user', placeholder: Language.UserName, required: true },
            { field: 'Password', type: 'password', icon: 'fa fa-lock', placeholder: Language.Password, required: true }
        ],
        buttons: [
            { text: Language.Login, handler: _login }
        ]
    });

    //methods
    this.render = function (dom) {
        var box = $('<div>').addClass('login').appendTo(dom);
        $('<h1>').html(config.AppName).appendTo(box);
        $('<h2>').html(Language.UserLogin).appendTo(box);
        form.render(box);
        $('<div>').addClass('copyright').html('&copy;2021 Known').appendTo(dom);
    }

    //private
    function _login(e) {
        if (!e.form.validate())
            return;

        var data = e.form.getData();
        var user = {
            UserName: data.UserName
        };
        app.admin(user);
    }
}