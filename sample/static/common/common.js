$(function () {
    $('.dropdown-toggle').click(function (event) {
        $(this).parent().addClass('open');
        return false;
    });

    $(document).click(function (event) {
        $('.dropdown').removeClass('open');
    });
});

var Message = {

    show: function () {
        $.messager.show({
            title: 'My Title',
            msg: 'Message will be closed after 4 seconds.',
            showType: 'show'
        });

        $.messager.show({
            title: 'My Title',
            msg: 'Message will be closed after 5 seconds.',
            timeout: 5000,
            showType: 'slide'
        });

        $.messager.show({
            title: 'My Title',
            msg: 'Message never be closed.',
            timeout: 0,
            showType: 'fade'
        });
    },

    alert: function (message) {
        $.messager.alert('提示', message, 'info');
    },

    confirm: function (message, callback) {
        $.messager.confirm('确认提示', message, function (r) {
            callback && callback(r);
        });
    },

    prompt: function () {
        $.messager.prompt('提示', 'Please enter your name:', function (r) {
            if (r) {
                alert('Your name is:' + r);
            }
        });
    },

    progress: function () {
        $.messager.progress({
            title: 'Please waiting',
            msg: 'Loading data...'
        });
        setTimeout(function () {
            $.messager.progress('close');
        }, 5000);
    }

};