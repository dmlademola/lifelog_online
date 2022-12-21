$('body').onload = function () {
    $('.top_nav .nav_icon.home').onclick = function () {
        window.location.assign("/lifelog/home/");
    }
    $('.top_nav .nav_icon.trash').onclick = function () {
        window.location.assign("/lifelog/trash/");
    }
    $('.top_nav .nav_icon.profile').onclick = function () {
        window.location.assign("/lifelog/profile-settings/");
    }
    $('.top_nav .nav_icon.signout').onclick = function () {
        window.location.assign("/lifelog/signout/");
    }
    if ($('body').contains($("#welcome"))) {
        setTimeout(function () {
            $('#welcome').parentNode.removeChild($('#welcome'));
        }, 2500);
        setTimeout(function () {
            $('#welcome').classList.add('welcome_close');
        }, 2000);
    }
}
