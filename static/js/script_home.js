var search_string = "";
function count_rem(len, max_len, elmnt) {
    max_len = Number(max_len);
    len = Number(len);
    rem = max_len - len;
    if (Number(rem) < 0) {
        elmnt.style.color = 'red';
    } else {
        elmnt.style.color = 'inherit';
    }
    return rem + " character(s) left.";
}

function vid_func(vid) {
    vid.onmouseover = function () {
        this.play();
        this.playbackRate = 3;
    }
    vid.onmouseout = function () {
        this.pause();
        this.currentTime = 0;
    }
    vid.ontimeupdate = function () {
        if (this.currentTime >= 30) {
            this.pause(); vid.currentTime = 0;
            this.play(); vid.playbackRate = 3;
        }
    }
}

function form_msg(elem, cl = "", message = "") {
    elem.classList.remove("suc");
    elem.classList.remove("err");
    if (message != "") {
        elem.style.visibility = 'visible';
        if (cl != "") {
            elem.classList.add(cl);
        }
        elem.innerHTML = message;
    } else {
        elem.style.visibility = 'hidden';
        elem.innerHTML = message;
    }
}
function save_event_ajax(brief, details) {
    var msg = $("#msg");
    if (details.length == 0 || brief.length == 0) {
        form_msg(msg, "err", "You need to write something in the details and brief boxes!");
        return;
    } else {
        form_msg(msg);
    }

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            response = JSON.parse(this.responseText);
            if (this.status == 200) {
                $('#fscreen').scrollTo(0, 0);
                if (response.success === true) {
                    form_msg(msg, "suc", response.message);
                    pagination_refresh_ajax('curr', false);
                } else {
                    form_msg(msg, "err", response.message);
                }
            } else {
                form_msg(msg, "err", "Sorry, an error occurred.");
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    $('#fscreen').scrollTo(0, 0);
    form_msg(msg, "", "<div class='pending'></div>Processing ...");

    var form_s = $forms('new_event');
    var data = new FormData(form_s);
    xmlhttp.open("POST", "/lifelog/ajax/new_event/", true);
    xmlhttp.send(data);
}

function edit_event_ajax(brief, details) {
    var msg = $('#e_msg');

    if (details.length == 0 || brief.length == 0) {
        form_msg(msg, "err", "You need to write something in the details and brief boxes!");
        return;
    } else {
        form_msg(msg);
    }

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                $('#fscreen').scrollTo(0, 0);
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    form_msg(msg, "suc", response.message);
                    pagination_refresh_ajax('curr', false);
                    edit_event_func(false, false, $forms('edit_event', 'event_id').value);
                } else {
                    form_msg(msg, "err", response.message);
                }
            } else {
                form_msg(msg, "suc", "Sorry, an error occurred.");
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    $('#fscreen').scrollTo(0, 0);
    form_msg(msg, "", "<div class='pending'></div>Processing ...");

    var form_s = $forms('edit_event');
    var data = new FormData(form_s);
    xmlhttp.open("POST", "/lifelog/ajax/edit_event/", true);
    xmlhttp.send(data);
}

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

function trash_event_ajax(del_elem, event_id) {
    event_id = event_id.replace('e', '')
    if (event_id.length < 1) {
        alert("That event isn't valid, try reloading this page!");
        return;
    }
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            del_elem.classList.add("icon4");
            del_elem.classList.remove("icon5");
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === true) {
                    pagination_refresh_ajax("curr");
                }
                msg_box_view(response.message)
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    del_elem.classList.add("icon5");
    del_elem.classList.remove("icon4");

    xmlhttp.open("GET", "/lifelog/ajax/trash_event/?id=" + event_id, true);
    xmlhttp.send();
}
function delete_file_ajax(event_id, file_id) {
    if (!confirm("This file will be deleted permanently\nThis cannot be undone!")) {
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
                    pagination_refresh_ajax('curr', false);
                    edit_event_func(false, false, event_id);
                }
                msg_box_view(response.message);
            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    xmlhttp.open("GET", "/lifelog/ajax/delete_file/?event_id=" + event_id + "&file_id=" + file_id, true);
    xmlhttp.send();
}
function edit_event_func(elem, refresh, event_id) {
    event_id = event_id.replace('e', '')
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (elem != false) {
                elem.classList.add("icon3");
                elem.classList.remove("icon5");
            }
            if (this.status == 200) {
                response = JSON.parse(this.responseText);
                if (response.success === false) {
                    msg_box_view(response.message);
                    return;
                }
                evnt = JSON.parse(response.message);
                evnt["uploads"] = JSON.parse(evnt["uploads"]);
                if (refresh === true) {
                    form_msg($('#e_msg'));
                }
                $('#e_brief').value = $('#e_details').value = '';
                $('#e_happy_moment').removeAttribute("checked");
                $('#e_uploads').value = '';
                $("div#e_uploads_preview").innerHTML = '<p class="upload_text">Click or drag files here...</p>';
                $('#event_id').value = event_id;
                $('#e_brief').value = evnt["brief"]
                if (evnt["uploads"].length > 0) {
                    var edit_text = "";
                    for (i = 0; i < evnt["uploads"].length; i++) {
                        if (evnt["uploads"][i]["type"] == "vid") {
                            tag = "<video muted loop><source src='/lifelog/stream/?id=" + evnt["uploads"][i]["id"] + "'>Sorry, your browser cannot play this video.</source></video>";
                        } else {
                            tag = "<img src='/lifelog/stream/?id=" + evnt["uploads"][i]["id"] + "' alt='missing file'></img>"
                        }
                        edit_text += "<div class='file_pare'><input type='text' placeholder='Add a caption' name='edit_cap" + (i + 1) + "' value='" + evnt["uploads"][i]["caption"] + "' class='input2' autocomplete='off'>" + tag + "<div class='action_pare'><span class='del' onclick='delete_file_ajax(\"" + event_id + "\", \"" + evnt["uploads"][i]["id"] + "\");'>Delete this.</span></div></div>";
                    }
                    $("#e_preview").innerHTML = edit_text;
                    $all("#e_preview .file_pare video").forEach(function (video, ind, arr) {
                        vid_func(video);
                    })
                    $("#e_preview").style.display = 'flex';
                } else {
                    $("#e_preview").innerHTML = '';
                    $("#e_preview").style.display = 'none';
                }
                if (evnt["happy_moment"] === true) {
                    checked = document.createAttribute("checked");
                    $('#e_happy_moment').attributes.setNamedItem(checked);
                } else {
                    $('#e_happy_moment').removeAttribute("checked");
                }
                var dateofevent = evnt["date_of_event"].split("-");
                var select = $('#e_year').children;
                for (i = 0; i < select.length; i++) {
                    select[i].removeAttribute("selected");
                    if (select[i].value == dateofevent[0]) {
                        var sel = document.createAttribute("selected");
                        select[i].attributes.setNamedItem(sel);
                    }
                }

                var select = $('#e_month').children;
                for (i = 0; i < select.length; i++) {
                    select[i].removeAttribute("selected");
                    if (select[i].value == dateofevent[1]) {
                        var sel = document.createAttribute("selected");
                        select[i].attributes.setNamedItem(sel);
                    }
                }

                var select = $('#e_day').children;
                for (i = 0; i < select.length; i++) {
                    select[i].removeAttribute("selected");
                    if (select[i].value == dateofevent[2]) {
                        var sel = document.createAttribute("selected");
                        select[i].attributes.setNamedItem(sel);
                    }
                }
                $('#e_details').value = evnt["details"];
                fscreen($('#e_event'));

            } else {
                msg_box_view('Sorry, an error occurred.');
            }
        }
    }

    xmlhttp.onerror = function () {
        msg_box_view('Failed to connect to the internet.');
    }

    if (elem != false) {
        elem.classList.add("icon5");
        elem.classList.remove("icon3");
    }

    xmlhttp.open("GET", "/lifelog/ajax/get_event/?id=" + event_id + "&e=true", true);
    xmlhttp.send();
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
                $('#fscreen_action').innerHTML = "<span class='icon icon3 icon_20px edit' onclick=\"edit_event_func(this, true, 'e" + event_id + "')\" title='Edit'></span><span class='icon icon4 icon_20px del' onclick=\"trash_event_ajax(this, 'e" + event_id + "')\" title='Move to Trash'></span>"
                fscreen($('#event_fscreen'));
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

function fscreen(elmnt) {
    $('#fscreen').style.display = 'flex';
    $('#fscreen').scrollTo(0, 0);
    $('#event_fscreen').style.display = 'none';
    $('#n_event').style.display = 'none';
    $('#e_event').style.display = 'none';
    elmnt.style.display = 'block';
}

function pagination_refresh_ajax(nav, close_fs = true) {
    if (close_fs == true) {
        $('#fscreen').style.display = "none";
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
                    if (nav != "curr") {
                        $('#events').scrollTo(0, 0);
                    }
                    $("#events").innerHTML = response.message;
                    event_listeners();
                } else {
                    if (response.message == "No more event found." && nav == "curr") {
                        $("#events").innerHTML = "<h1 class='text' id='text'>You have no event yet, <span onclick='fscreen(document.getElementById(\"n_event\"));' class='create'>create an event</span></h1>"
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
        }, 1000000)
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
    }, 1000000)
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
    $('.add').onclick = function () {
        fscreen(document.getElementById('n_event'));
    }
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
    $forms('edit_event').onsubmit = function (event) {
        event.preventDefault();
        edit_event_ajax($('#e_brief').value, $('#e_details').value);
    }
    $forms('new_event').onsubmit = function (event) {
        event.preventDefault();
        save_event_ajax($('#brief').value, $('#details').value);
    }
    $forms('edit_event', 'brief').oninput = function () {
        $("#e_brief_count").innerHTML = count_rem(this.value.trim().length, 30, $("#e_brief_count"));
        form_msg($("#e_msg"))
    }
    $forms('edit_event', 'brief').onblur = function () {
        $("#e_brief_count").style.visibility = "hidden";
    }
    $forms('edit_event', 'brief').onfocus = function () {
        $("#e_brief_count").style.visibility = "visible";
        $("#e_brief_count").innerHTML = count_rem(this.value.trim().length, 30, $("#e_brief_count"));
    }
    $forms('edit_event', 'uploads').onchange = function () {
        if (this.files.length > 0) {
            var i = 0;
            var tag = "";
            while (i < this.files.length) {
                var f = this.files[i];
                if (f.type.search("image") != -1) {
                    tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><img src='" + URL.createObjectURL(f) + "' alt='" + f.name + "'/></div><div class='caption_cont'><input name='caption" + (i + 1) + "' placeholder='Add a caption...(" + f.name + ")' onclick='event.stopImmediatePropagation();' autocomplete='off' /></div></div>";
                } else if (f.type.search("video") != -1) {
                    tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><video muted><source src='" + URL.createObjectURL(f) + "'>Sorry, your browser can't play this video.</source></video></div><div class='caption_cont'><input name='caption" + (i + 1) + "' placeholder='Add a caption...(" + f.name + ")' onclick='event.stopImmediatePropagation();' autocomplete='off' /></div></div>";
                }
                i++;
            }
            $("div#e_uploads_preview").innerHTML = tag;
            $("div#e_uploads_preview").firstElementChild.classList.add("vis");
            $('.e_cont').innerHTML = $("div#e_uploads_preview").outerHTML + "<span>New Uploads(" + this.files.length + ")</span>";
            $all(".e_uploads_preview .preview_cont .file video").forEach(function (video, ind, arr) {
                vid_func(video);
            });
            tag = '';
        } else {
            $("div#e_uploads_preview").innerHTML = '<p class="upload_text">Click or drag files here...</p>';
            $('.e_cont').innerHTML = $("div#e_uploads_preview").outerHTML + "";
        }
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'day').onchange = function () {
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'month').onchange = function () {
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'year').onchange = function () {
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'happy_moment').onchange = function () {
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'details').oninput = function () {
        $("#e_desc_count").innerHTML = count_rem(this.value.trim().length, 8000, $("#e_desc_count"));
        form_msg($("#e_msg"))

    }
    $forms('edit_event', 'details').onblur = function () {
        $("#e_desc_count").style.visibility = "hidden";
    }
    $forms('edit_event', 'details').onfocus = function () {
        $("#e_desc_count").style.visibility = "visible";
        $("#e_desc_count").innerHTML = count_rem(this.value.trim().length, 8000, $("#e_desc_count"));
    }
    $forms('new_event', 'brief').oninput = function () {
        $("#brief_count").innerHTML = count_rem(this.value.trim().length, 30, $("#brief_count"));
        form_msg($("#msg"));
    }
    $forms('new_event', 'brief').onblur = function () {
        $("#brief_count").style.visibility = "hidden";
    }
    $forms('new_event', 'brief').onfocus = function () {
        $("#brief_count").style.visibility = "visible";
        $("#brief_count").innerHTML = count_rem(this.value.trim().length, 30, $("#brief_count"));
    }
    $forms('new_event', 'uploads').onchange = function () {
        if (this.files.length > 0) {
            var i = 0;
            var tag = "";
            while (i < this.files.length) {
                var f = this.files[i];
                if (f.type.search("image") != -1) {
                    tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><img src='" + URL.createObjectURL(f) + "' alt='" + f.name + "'/></div><div class='caption_cont'><input name='caption" + (i + 1) + "' placeholder='Add a caption...(" + f.name + ")' onclick='event.stopImmediatePropagation();' autocomplete='off' /></div></div>";
                } else if (f.type.search("video") != -1) {
                    tag += "<div class='preview_cont'><span class='next' onclick='next_slide(event, this);'>&#10095;</span><span class='prev' onclick='prev_slide(event, this)'>&#10094;</span><div class='file'><video muted><source src='" + URL.createObjectURL(f) + "'>Sorry, your browser can't play this video.</source></video></div><div class='caption_cont'><input name='caption" + (i + 1) + "' placeholder='Add a caption...(" + f.name + ")' onclick='event.stopImmediatePropagation();' autocomplete='off' /></div></div>";
                }
                i++;
            }
            $("div#uploads_preview").innerHTML = tag;
            $("div#uploads_preview").firstElementChild.classList.add("vis");
            $('.cont').innerHTML = $("div#uploads_preview").outerHTML + "<span>New Uploads(" + this.files.length + ")</span>";
            $all(".uploads_preview .preview_cont .file video").forEach(function (video, ind, arr) {
                vid_func(video);
            })
            tag = '';
        } else {
            $("div#uploads_preview").innerHTML = '<p class="upload_text">Click or drag files here...</p>';
            $('.cont').innerHTML = $("div#uploads_preview").outerHTML + "";
        }
        form_msg($("#msg"));
    }
    $forms('new_event', 'day').onchange = function () {
        form_msg($("#msg"));
    }
    $forms('new_event', 'month').onchange = function () {
        form_msg($("#msg"));
    }
    $forms('new_event', 'year').onchange = function () {
        form_msg($("#msg"));
    }
    $forms('new_event', 'happy_moment').onchange = function () {
        form_msg($("#msg"));
    }
    $forms('new_event', 'details').oninput = function () {
        $("#desc_count").innerHTML = count_rem(this.value.trim().length, 8000, $("#desc_count"));
        form_msg($("#msg"));
    }
    $forms('new_event', 'details').onblur = function () {
        $("#desc_count").style.visibility = "hidden";
    }
    $forms('new_event', 'details').onfocus = function () {
        $("#desc_count").style.visibility = "visible";
        $("#desc_count").innerHTML = count_rem(this.value.trim().length, 8000, $("#desc_count"));
    }
    $('[name=new_event] [type=reset]').onclick = function () {
        $("div#uploads_preview").innerHTML = '<p class="upload_text">Click or drag files here...</p>';
        form_msg($("#msg"));
    }
}
function event_listeners() {
    $all('.event').forEach(function (val, ind, arr) {
        val.onclick = function () {
            evnt_fscreen(this.id);
        };
    })

    // $('div#e_uploads_preview').ondragover = function (event) {
    //     event.preventDefault();
    //     alert(event);
    //     event.dataTransfer.setData("text", event.target.name);
    // }
    // $('div#e_uploads_preview').ondrop = function (event) {
    //     event.preventDefault();
    //     var data = event.dataTransfer.getData("text");
    //     alert(data);
    //     // event.target.appendChild(document.getElementById(data));
    // }
    // $all('.event .preview video').forEach(function (val, ind, arr) {
    //     val.onmouseover = function () {
    //         this.playbackRate = 3;
    //         this.play();
    //     };
    // })
    // $all('.event .preview video').forEach(function (val, ind, arr) {
    //     val.onmouseout = function () {
    //         this.currentTime = 0;
    //         this.pause();
    //     };
    // })
    // $all('.event .preview video').forEach(function (val, ind, arr) {
    //     val.ontimeupdate = function () {
    //         vid_preview(this);
    //     }
    // })
    $all('.event .ent_cont .action .edit').forEach(function (val, ind, arr) {
        val.onclick = function (event) {
            event.stopImmediatePropagation();
            edit_event_func(this, true, this.parentNode.parentNode.parentNode.id);
        };
    })
    $all('.event .ent_cont .action .del').forEach(function (val, ind, arr) {
        val.onclick = function (event) {
            event.stopImmediatePropagation();
            trash_event_ajax(this, this.parentNode.parentNode.parentNode.id);
        };
    })
}
