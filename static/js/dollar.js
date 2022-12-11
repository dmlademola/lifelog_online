function $(selector) {
    return document.querySelector(selector);
}
function $all(selector) {
    return document.querySelectorAll(selector);
}
function $forms(form_name, elmnt_name) {
    if (elmnt_name != undefined) {
        return document.forms[form_name][elmnt_name]
    } else {
        return document.forms.namedItem(form_name)
    }
}
