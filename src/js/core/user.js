//---------------------------user---------------------------------------------//
var User = {

    key: 'known_user',

    setUser: function (user) {
        sessionStorage.setItem(this.key, JSON.stringify(user));
    },

    getUser: function () {
        return JSON.parse(sessionStorage.getItem(this.key));
    }

};