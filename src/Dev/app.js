app.setTabbar([
    { icon: 'fa fa-home', id: 'tbHome', name: '首页', hideTop: true, component: new DevHome() },
    { icon: 'fa fa-wifi', id: 'tbOnline', name: '监测', title: '在线监测', component: new DevOnline() },
    { icon: 'fa fa-bell', id: 'tbAlarm', name: '报警', title: '实时报警' },
    { icon: 'fa fa-user-o', id: 'tbUser', name: '我的', title: '我的信息', component: new DevUser() },
]);
app.loadUser(baseUrl + '/WIMS/Home/GetUserData');
$('#tbUser .badge').html(3).show();

function DevHome() {
    //fields
    var slider = new Slider({
        height: '35%',
        items: [
            { img: '/static/img/bg.jpg' },
            { img: sysStaticUrl + '/img/bg.jpg' }
        ]
    });

    var menu = new Menu({
        items: [
            { bgColor: '#0096dd', id: 'menuOnline', icon: 'fa fa-wifi', name: '实时监测' },
            { bgColor: '#dd4b39', id: 'menuAlarm', icon: 'fa fa-bell', name: '实时报警' },
            { bgColor: '#00a0ff', id: 'menuMap', icon: 'fa fa-map-marker', name: '地图显示' },
            { bgColor: '#66cc66', id: 'menuVideo', icon: 'fa fa-video-camera', name: '视频监控' },
            { bgColor: '#eecc00', id: 'menuChart', icon: 'fa fa-bar-chart', name: '在线分析' },
            { bgColor: '#00a65a', id: 'menuAdd', icon: 'fa fa-plus', name: '功能待加' }
        ]
    });

    //methods
    this.render = function () {
        var elem = $('<div class="content">');
        slider.render().appendTo(elem);
        menu.render().appendTo(elem);
        return elem;
    }

    this.mounted = function () {
    }
}

function DevOnline() {
    var tabs = new Tabs({
        items: [
            { name: '实时监测' },
            { name: '地图监测' },
            { name: '实时报警' },
            { name: '视频监控' }
        ]
    });

    this.render = function () {
        var elem = $('<div class="content">');
        tabs.render().appendTo(elem);
        return elem;
    }
}

function DevUser() {
    //fields
    var list = new List({
        style: 'info',
        items: function () {
            return [
                { icon: 'fa fa-user', title: app.user.Name + '(' + app.user.UserName + ')' },
                { icon: 'fa fa-mobile', title: app.user.Mobile },
                { icon: 'fa fa-envelope-o', title: app.user.Email },
                { icon: 'fa fa-university', title: app.user.OrgName || app.user.CompName }
            ];
        }
    });

    //methods
    this.render = function () {
        var elem = $('<div class="content">');
        $('<div class="avatar">').html('<img src="' + app.user.AvatarUrl + '">').appendTo(elem);
        list.render().appendTo(elem);
        _createLogoutButton(elem);
        return elem;
    }

    //private
    function _createLogoutButton(dom) {
        var btn = $('<div class="btnLogout">').appendTo(dom);
        $('<button class="danger">')
            .html('安全退出')
            .appendTo(btn)
            .click(function () {
                Layer.confirm('确定要退出系统？', function () {
                    $.post(baseUrl + '/signout', function (result) {
                        Utils.setUser(null);
                        Utils.setCodes(null);
                        window.location = baseUrl + '/login';
                    });
                });
            });
    }
}