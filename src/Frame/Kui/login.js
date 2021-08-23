var isMobile = checkMobile();
setUser(null);

$('#ltLogin').html(Language.UserLogin);
$('#ltScan').html(Language.ScanCode);
$('#userName').attr('placeholder', Language.UserName);
$('#password').attr('placeholder', Language.Password);
$('#captcha').attr('placeholder', Language.Captcha);
$('#imgCaptcha').attr('title', Language.RefreshCaptcha);
$('#btnLogin').html(Language.Login);
$('#TechSupport').html(Language.TechSupport);

$(document).contextmenu(function (e) {
    e.preventDefault();
});
$('input[onenter]').keydown(function (event) {
    if ((event.keyCode || event.which) === 13) {
        event.preventDefault();
        var method = $(this).attr("onenter");
        eval(method);
    }
});

$('#userName').focus();
$('#imgCaptcha').click(function () {
    var img = $(this);
    var src = img.attr('src').split('?')[0];
    img.attr('src', src + '?rnd=' + Math.random());
});
$('#btnLogin').click(function () {
    $('.form-item input').removeClass('error');
    var userName = getFormValue('userName');
    var password = getFormValue('password');
    var captcha = getFormValue('captcha');
    if (userName === '' || password === '' || captcha === '')
        return;

    var text = $(this).html();
    var btn = $(this).attr('disabled', true).html(Language.Logining);
    $.post(baseUrl + '/signin', {
        userName: userName, password: password,
        captcha: captcha, isMobile: isMobile
    }, function (result) {
        btn.removeAttr('disabled').html(text);
        if (result.ok) {
            $('#message').html('<span style="color:#00f">' + result.message + '</span>');
            setUser(result.data.Data);
            location = baseUrl + result.data.url;
        } else {
            $('#message').html(result.message);
        }
    });
});

if (!isMobile) {
    $('.login-bell img').click(function () {
        var icon = $(this).data('icon') || '1';
        icon = icon === '1' ? '2' : '1';
        $(this).data('icon', icon)
            .attr('src', 'static/img/login_icon' + icon + '.png');
        $('.form').hide();
        $('#login' + icon).show();
    });
}

function getFormValue(id) {
    var elem = $('#' + id);
    var value = $.trim(elem.val());
    if (value === '') {
        elem.addClass('error');
    }
    return value;
}

function setUser(user) {
    if (!user) {
        sessionStorage.removeItem('Known_User');
    } else {
        sessionStorage.setItem('Known_User', JSON.stringify(user));
    }
}

function checkMobile() {
    var agent = navigator.userAgent;
    var agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
    var flag = false;
    for (var i = 0; i < agents.length; i++) {
        if (agent.indexOf(agents[i]) > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}

//var stars = 800;  /*星星的密集程度，数字越大越多*/
//var $stars = $('.stars');
//var r = 800;   /*星星的看起来的距离,值越大越远,可自行调制到自己满意的样子*/
//for (var i = 0; i < stars; i++) {
//    var $star = $('<div/>').addClass('star');
//    $stars.append($star);
//}
//$('.star').each(function () {
//    var cur = $(this);
//    var s = 0.2 + (Math.random() * 1);
//    var curR = r + (Math.random() * 300);
//    cur.css({
//        transformOrigin: '0 0 ' + curR + 'px',
//        transform: ' translate3d(0,0,-' + curR + 'px) rotateY(' + (Math.random() * 360) + 'deg) rotateX(' + (Math.random() * -50) + 'deg) scale(' + s + ',' + s + ')'
//    });
//});