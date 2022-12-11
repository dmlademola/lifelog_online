// var r = 0;
function psw_vis(psw, elements) {
    if (psw.type == "password") {
        psw.type = "text";
        elements.classList.remove("icon1");
        elements.classList.add("icon2");
    } else {
        psw.type = "password";
        elements.classList.remove("icon2");
        elements.classList.add("icon1");
    }
    psw.focus();
}

function empty_this(elmnt) {
    elmnt.value = "";
    elmnt.focus();
}
