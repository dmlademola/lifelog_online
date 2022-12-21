var search_string = "";
function search_ajax() {
    if ($forms('search', 'search_str').value == '') {
        pagination_refresh_ajax("curr");
        return;
    }
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    $('#events').innerHTML = response.message;
                    event_listeners();
                } else {
                    msg_box_view(response.message);
                }
            } else {
                msg_box_view("Sorry, an error occurred.");
            }
            $('.loader_cont').style.display = 'none';
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    $('.loader_cont').style.display = 'flex';

    var form_s = $forms('search');
    var data = new FormData(form_s);
    xmlhttp.open("POST", "/lifelog/ajax/search/", true);
    xmlhttp.send(data);
}
function restore_event_ajax(elem, event_id) {
    event_id = event_id.replace('e', '')
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            elem.classList.add("icon9");
            elem.classList.remove("icon5");
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    pagination_refresh_ajax("curr");
                }
                msg_box_view(response.message);
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    elem.classList.add("icon5");
    elem.classList.remove("icon9");

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    xmlhttp.open("GET", "/lifelog/ajax/restore_event/?id=" + event_id, true);
    xmlhttp.send();
}
function delete_event_ajax(elem, event_id) {
    if (!confirm("Delete this event and it's media permanently?\nThis action cannot be undone!")) {
        return;
    }
    event_id = event_id.replace('e', '')
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            elem.classList.add("icon4");
            elem.classList.remove("icon5");
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    pagination_refresh_ajax("curr");
                }
                msg_box_view(response.message);
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    elem.classList.add("icon5");
    elem.classList.remove("icon4");

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    xmlhttp.open("GET", "/lifelog/ajax/delete_event/?id=" + event_id, true);
    xmlhttp.send();
}
function pagination_refresh_ajax(nav) {
    $('#fscreen').style.display = "none";
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    if (nav != "curr") {
                        $('#events').scrollTo(0, 0);
                    }
                    $("#events").innerHTML = response.message;
                    event_listeners();
                } else {
                    if (response.message == "No more event found." && nav == "curr") {
                        $("#events").innerHTML = "<h1 class='text' id='text'>No event found here.</h1>"
                    }
                    msg_box_view(response.message);
                }
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
            $('.loader_cont').style.display = 'none';
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    $('.loader_cont').style.display = 'flex';

    xmlhttp.open("GET", "/lifelog/ajax/pagination/?nav=" + nav, true);
    xmlhttp.send();
}
function msg_box_view(message) {
    if ($('body').contains($('div.msg_box'))) {
        clearTimeout(del_msg_box);
        $('div.msg_box p.text1').innerHTML = message;
        del_msg_box = setTimeout(function () {
            if ($('body').contains($('div.msg_box'))) {
                $('div.msg_box').parentNode.removeChild($('div.msg_box'));
            }
        }, 10000)
        return;
    }
    var msg_box = document.createElement("div");
    var _class = document.createAttribute("class");
    _class.value = "msg_box";
    msg_box.attributes.setNamedItem(_class);
    var close = document.createElement("span");
    var _class = document.createAttribute("class");
    _class.value = 'close1';
    close.attributes.setNamedItem(_class);
    var click_fun = document.createAttribute("onclick");
    click_fun.value = "$('div.msg_box').parentNode.removeChild($('div.msg_box'));";
    close.attributes.setNamedItem(click_fun);
    var title = document.createAttribute("title");
    title.value = "Close.";
    close.attributes.setNamedItem(title);
    close.innerHTML = '&times;';
    msg_box.appendChild(close);
    document.body.insertBefore(msg_box, document.body.childNodes[0]);

    var text1 = document.createElement("p");
    var _class = document.createAttribute("class");
    _class.value = "text1";
    text1.attributes.setNamedItem(_class);
    var text = document.createTextNode(message);
    text1.appendChild(text);
    msg_box.appendChild(text1);
    del_msg_box = setTimeout(function () {
        if ($('body').contains($('div.msg_box'))) {
            $('div.msg_box').parentNode.removeChild($('div.msg_box'));
        }
    }, 10000)
}
function evnt_fscreen(event_id) {
    event_id = event_id.replace('e', '')
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === false) {
                    msg_box_view(response.message);
                    return;
                }
                evnt = JSON.parse(response.message);
                evnt["uploads"] = JSON.parse(evnt["uploads"]);
                $('#fscreen_brief').innerHTML = evnt["brief"]

                if (evnt["uploads"].length > 0) {
                    var tag = "";
                    for (i = 0; i < evnt["uploads"].length; i++) {
                        if (evnt["uploads"][i]["type"] == "vid") {
                            tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><video controls><source src='/lifelog/stream/?id=" + evnt["uploads"][i]["id"] + "'>Sorry, your browser can't play this video.</source></video></div><div class='caption_cont'>" + evnt["uploads"][i]["caption"] + "</div></div>";
                        } else {
                            tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><img src='/lifelog/stream/?id=" + evnt["uploads"][i]["id"] + "'/></div><div class='caption_cont'>" + evnt["uploads"][i]["caption"] + "</div></div>";
                        }
                    }
                    $("#uploads_view").innerHTML = tag;
                    $("#uploads_view").firstElementChild.classList.add("vis");
                    // $('.e_cont').innerHTML = $("div#e_uploads_preview").outerHTML + "<span>New Uploads(" + this.files.length + ")</span>";
                    $("#uploads_view").style.display = 'flex';
                    tag = '';
                } else {
                    $("#uploads_view").innerHTML = '';
                    $("#uploads_view").style.display = 'none';
                }
                $('#fscreen_desc').innerHTML = evnt["details"];
                $('#fscreen_dateofevent').innerHTML = evnt["date_of_event"];
                $('#fscreen_action').innerHTML = "<span class='icon icon9 icon_20px res' onclick=\"restore_event_ajax(this, 'e" + event_id + "')\" title='Restore.'></span><span class='icon icon4 icon_20px del' onclick=\"delete_event_ajax(this, 'e" + event_id + "')\" title='Delete permanently.'></span>"
                fscreen();
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    xmlhttp.open("GET", "/lifelog/ajax/get_event/?id=" + event_id + "&e=false", true);
    xmlhttp.send();
}
function next_slide(event, elem) {
    if (elem.parentNode.nextElementSibling != null) {
        for (i = 0; i < elem.parentNode.parentNode.children.length; i++) {
            elem.parentNode.parentNode.children[i].classList.remove("vis");
        }
        $all('#fscreen video').forEach(function (vid, ind, arr) {
            vid.pause();
        })
        elem.parentNode.nextElementSibling.classList.add("vis");
    }
    event.stopImmediatePropagation();
}
function prev_slide(event, elem) {
    if (elem.parentNode.previousElementSibling != null) {
        for (i = 0; i < elem.parentNode.parentNode.children.length; i++) {
            elem.parentNode.parentNode.children[i].classList.remove("vis");
        }
        $all('#fscreen video').forEach(function (vid, ind, arr) {
            vid.pause();
        })
        elem.parentNode.previousElementSibling.classList.add("vis");
    }
    event.stopImmediatePropagation();
}
function fscreen(elmnt) {
    $('#fscreen').style.display = 'flex';
    $('#fscreen').scrollTo(0, 0);
    $('#event_fscreen').style.display = 'block';
}
$('body').onload = function () {
    element_listeners();
    event_listeners();
    if ($('body').contains($("#welcome"))) {
        setTimeout(function () {
            $('#welcome').parentNode.removeChild($('#welcome'));
        }, 2500);
        setTimeout(function () {
            $('#welcome').classList.add('welcome_close');
        }, 2000);
    }
}
function element_listeners() {
    $all('.close').forEach(function (val, ind, arr) {
        val.onclick = function () {
            $all('#fscreen video').forEach(function (vid, ind, arr) {
                vid.pause();
            })
            $('#fscreen').style.display = 'none';
        };
    })
    $('#next_btn').onclick = function () {
        pagination_refresh_ajax("next");
    }
    $('#prev_btn').onclick = function () {
        pagination_refresh_ajax("prev");
    }
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
    $('form[name=search] span#clear').onclick = function () {
        this.classList.add("rotate");
        setTimeout(function () {
            $('form[name=search] span#clear').classList.remove("rotate");
        }, 1000);
        $forms('search', 'search_str').value = search_string = "";
        pagination_refresh_ajax("curr");
        $forms('search', 'search_str').focus();
    }
    $forms('search', 'search_str').onkeyup = function (event) {
        if ($forms('search', 'search_str').value == search_string) {
            return;
        }
        event.preventDefault();
        search_string = $forms('search', 'search_str').value;
        search_ajax();
    }
}
function event_listeners() {
    $all('.event').forEach(function (val, ind, arr) {
        val.onclick = function () {
            evnt_fscreen(this.id);
        };
    })
    $all('.event .ent_cont .action .res').forEach(function (val, ind, arr) {
        val.onclick = function (event) {
            event.stopImmediatePropagation();
            restore_event_ajax(this, this.parentNode.parentNode.parentNode.id);
        };
    })
    $all('.event .ent_cont .action .del').forEach(function (val, ind, arr) {
        val.onclick = function (event) {
            event.stopImmediatePropagation();
            delete_event_ajax(this, this.parentNode.parentNode.parentNode.id);
        };
    })
}
