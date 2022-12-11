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


function search_ajax(val) {
    if (home != 1 && val == '') {
        pagination_refresh_ajax('curr');
        home = 1;
        return;
    } else if (val = '') {
        return;
    }
    home = 0;
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
                msg_box_view("Sorry, an error occurred on the server.");
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

function close_wel() {
    setTimeout(() => {
        document.getElementById('welcome').parentNode.removeChild(document.getElementById('welcome'));
    }, 3500);
    setTimeout(() => {
        document.getElementById('welcome').classList.add('welcome_close');
    }, 3000);
}

function count_rem(len, max_len, elmnt) {
    max_len = Number(max_len);
    len = Number(len);
    rem = max_len - len;
    if (Number(rem) < 0) {
        document.getElementById(elmnt).style.color = 'red';
    } else {
        document.getElementById(elmnt).style.color = 'inherit';
    }
    return rem + " characters left.";
}

function vid_func(video) {
    video.onmouseover = '';
    video.onmouseout = '';
    video.ontimeupdate = '';
    video.playbackRate = 1;
    video.muted = false;
    video.volume = 1.0;
    video.setAttribute('controls', '');
}

function empty_this(elmnt) {
    elmnt.value = "";
    elmnt.focus();
}

function vid_preview(vid) {
    if (vid.currentTime >= 10) {
        vid.currentTime = 0;
        vid.play();
    }
}

function animate_progress(prog, prog_val) {
    var elmnt = document.getElementById(prog_val);
    var width = parseFloat(elmnt.style.width.replace('%', ''));
    // var width = parseFloat(document.getElementById("prog_val").style.width.replace('%', ''));
    var anim = setInterval(frame, 1);
    function frame() {
        if (width >= 100 || width >= prog) {
            clearInterval(anim);
        } else {
            width = width + 0.1;
            elmnt.style.width = width + '%';
        }
    }
}

function disable_fields(disable) {
    var inputs = document.querySelectorAll('#new_event input');
    var selects = document.querySelectorAll('#new_event #date_of_event select');
    var texta = document.querySelectorAll('#new_event textarea');
    var butts = document.querySelectorAll('#new_event .form_div button');

    if (disable === true) {
        inputs.forEach(function (item, i, arr) {
            dis = document.createAttribute('disabled');
            dis.value = '';
            arr[i].attributes.setNamedItem(dis);
        });
        selects.forEach(function (item, i, arr) {
            dis = document.createAttribute('disabled');
            dis.value = '';
            arr[i].attributes.setNamedItem(dis);
        });
        texta.forEach(function (item, i, arr) {
            dis = document.createAttribute('disabled');
            dis.value = '';
            arr[i].attributes.setNamedItem(dis);
        });
        butts.forEach(function (item, i, arr) {
            dis = document.createAttribute('disabled');
            dis.value = '';
            arr[i].attributes.setNamedItem(dis);
        });
    } else {
        inputs.forEach(function (item, i, arr) {
            arr[i].removeAttribute('disabled');
        });
        selects.forEach(function (item, i, arr) {
            arr[i].removeAttribute('disabled');
        });
        texta.forEach(function (item, i, arr) {
            arr[i].removeAttribute('disabled');
        });
        butts.forEach(function (item, i, arr) {
            arr[i].removeAttribute('disabled');
        });
    }
}

function save_event_ajax(event, brief, details) {
    event.preventDefault();
    var msg = document.getElementById('msg');

    if (details.length == 0 || brief.length == 0) {
        msg.style.visibility = 'visible';
        msg.innerHTML = "You need to write something in the details and brief boxes!";
        return;
    } else {
        msg.style.visibility = 'hidden';
        msg.innerHTML = '';
    }

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (document.getElementById('upload1').value != '' || document.getElementById('upload2').value != '' || document.getElementById('upload3').value != '') {
                clearInterval(up_prog);
                disable_fields(false);
            }
            document.getElementById('prog_cont').style.visibility = 'hidden';
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                document.getElementById('fscreen').scrollTo(0, 0);
                response = JSON.parse(this.responseText);

                if (response.success === true) {
                    msg.style.visibility = 'visible';
                    msg.innerHTML = response.message;
                    animate_progress('100', 'prog_val');
                    if (document.forms['search']['search_str'].value != '') {
                        search_ajax(event, document.forms['search']['search_str'].value);
                    } else {
                        pagination_refresh_ajax('curr');
                    }
                } else {
                    msg.style.visibility = 'visible';
                    msg.innerHTML = response.message;
                    animate_progress('0', 'prog_val');
                }
            }
        }
    }

    if (document.getElementById('upload1').value != '' || document.getElementById('upload2').value != '' || document.getElementById('upload3').value != '') {
        document.getElementById('fscreen').scrollTo(0, 0);
        msg.style.visibility = 'visible';
        msg.innerHTML = 'Processing ...';
        document.getElementById('prog_cont').style.visibility = 'visible';
        var up_prog = setInterval(function () {
            disable_fields(true);

            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    response = JSON.parse(this.responseText);

                    if (response.progress === true) {
                        animate_progress(response.message, 'prog_val');
                    }
                    if (response.progress == 'stopped') {
                        animate_progress('100', 'prog_val');
                    }
                }
            }
            xmlhttp.open("POST", "upload_prog_script.php", true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send("field=new")
        }, 1000);
    }
    var form_s = document.forms.namedItem("new_event");
    var data = new FormData(form_s);
    xmlhttp.open("POST", "new_event_script.php", true);
    xmlhttp.send(data);
}

function edit_event_ajax(event, brief, details) {
    event.preventDefault();
    var msg = document.getElementById('e_msg');

    if (details.length == 0 || brief.length == 0) {
        msg.style.visibility = 'visible';
        msg.innerHTML = "You need to write something in the details and brief boxes!";
        return;
    } else {
        msg.style.visibility = 'hidden';
        msg.innerHTML = '';
    }

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (document.getElementById('e_upload1').value != '' || document.getElementById('e_upload2').value != '' || document.getElementById('e_upload3').value != '') {
                clearInterval(up_prog);
                disable_fields(false);
            }
            document.getElementById('e_prog_cont').style.visibility = 'hidden';
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                document.getElementById('fscreen').scrollTo(0, 0);
                response = JSON.parse(this.responseText);

                if (response.success === true) {
                    msg.style.visibility = 'visible';
                    msg.innerHTML = response.message;
                    animate_progress('100', 'e_prog_val');
                    if (document.forms['search']['search_str'].value != '') {
                        search_ajax(event, document.forms['search']['search_str'].value);
                    } else {
                        pagination_refresh_ajax('curr');
                    }
                }
                if (response.message.indexOf("Deleted first file successfully.") != -1) {
                    if (document.querySelector('#file1').contains(document.querySelector('#file1 video'))) {
                        document.querySelector('#file1 video').style.opacity = 0.2;
                    } else if (document.querySelector('#file1').contains(document.querySelector('#file1 img'))) {
                        document.querySelector('#file1 img').style.opacity = 0.2;
                    }
                    document.querySelector('#file1 .action_pare').innerHTML = "<span class='del1'>Deleted.</span>";
                }
                if (response.message.indexOf("Deleted second file successfully.") != -1) {
                    if (document.querySelector('#file2').contains(document.querySelector('#file2 video'))) {
                        document.querySelector('#file2 video').style.opacity = 0.2;
                    } else if (document.querySelector('#file2').contains(document.querySelector('#file2 img'))) {
                        document.querySelector('#file2 img').style.opacity = 0.2;
                    }
                    document.querySelector('#file2 .action_pare').innerHTML = "<span class='del1'>Deleted.</span>";
                }
                if (response.message.indexOf("Deleted third file successfully.") != -1) {
                    if (document.querySelector('#file3').contains(document.querySelector('#file3 video'))) {
                        document.querySelector('#file3 video').style.opacity = 0.2;
                    } else if (document.querySelector('#file3').contains(document.querySelector('#file3 img'))) {
                        document.querySelector('#file3 img').style.opacity = 0.2;
                    }
                    document.querySelector('#file3 .action_pare').innerHTML = "<span class='del1'>Deleted.</span>";
                }
            }
        }
    }

    if (document.getElementById('e_upload1').value != '' || document.getElementById('e_upload2').value != '' || document.getElementById('e_upload3').value != '') {
        document.getElementById('fscreen').scrollTo(0, 0);
        msg.style.visibility = 'visible';
        msg.innerHTML = 'Processing ...';
        document.getElementById('e_prog_cont').style.visibility = 'visible';
        var up_prog = setInterval(function () {
            disable_fields(true);

            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    response = JSON.parse(this.responseText);

                    if (response.progress === true) {
                        animate_progress(response.message, 'e_prog_val');
                    }
                    if (response.progress == 'stopped') {
                        animate_progress('100', 'e_prog_val');
                    }
                }
            }
            xmlhttp.open("POST", "upload_prog_script.php", true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send("field=edit")
        }, 1000);
    }
    var form_s = document.forms.namedItem("edit_event");
    var data = new FormData(form_s);
    xmlhttp.open("POST", "edit_event_script.php", true);
    xmlhttp.send(data);
}

function event_refresh_ajax(id) {
    if (!document.getElementById('events').contains(document.getElementById(id))) {
        return;
    }
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            response = this.responseText.trim();
            document.getElementById(id).outerHTML = response;
        }
    }
    xmlhttp.open("POST", "refresh_event_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("id=" + id);
}

function trash_event(del_elem, event_id) {
    if (event_id.length < 1) {
        alert("That event isn't valid, try reloading this page!");
        return;
    }
    del_elem.classList.add("icon5");
    del_elem.classList.remove("icon4");
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            del_elem.classList.add("icon4");
            del_elem.classList.remove("icon5");
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                if (document.body.contains(document.querySelector('div.msg_box'))) {
                    document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
                }

                document.getElementById('fscreen').style.display = 'none';
                var msg_box = document.createElement("div");
                var _class = document.createAttribute("class");
                _class.value = "msg_box";
                msg_box.attributes.setNamedItem(_class);
                var close = document.createElement("span");
                var _class = document.createAttribute("class");
                _class.value = 'close1';
                close.attributes.setNamedItem(_class);
                var click_fun = document.createAttribute("onclick");
                click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                close.attributes.setNamedItem(click_fun);
                var title = document.createAttribute("title");
                title.value = "Close.";
                close.attributes.setNamedItem(title);
                // close.appendChild(document.createTextNode('X'));
                close.innerHTML = '&times;';
                msg_box.appendChild(close);
                document.body.insertBefore(msg_box, document.body.childNodes[0]);

                var text = document.createElement("p");
                var _class = document.createAttribute("class");
                _class.value = "text";
                text.attributes.setNamedItem(_class);
                var text_val = document.createTextNode(response);
                text.appendChild(text_val);
                msg_box.appendChild(text);

                if (response.indexOf("Event moved to trash successfully!") != -1 || response.indexOf("This event is already in the trash!") != -1) {
                    document.getElementById(event_id).style.display = 'none';

                    var text = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "restore_act";
                    text.attributes.setNamedItem(_class);
                    var title = document.createAttribute("title");
                    title.value = "Restore last trashed event.";
                    text.attributes.setNamedItem(title);
                    var click_fun = document.createAttribute("onclick");
                    click_fun.value = "restore_event('" + event_id + "');";
                    text.attributes.setNamedItem(click_fun);
                    var text_val = document.createTextNode("Restore");
                    text.appendChild(text_val);
                    msg_box.appendChild(text);
                }
            }
        }
    }
    xmlhttp.open("POST", "trash_event_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("id=" + event_id);
}

function restore_event(event_id) {
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
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                if (response.indexOf("done") != -1) {
                    document.getElementById(event_id).style.display = "flex";
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode("Restored successfully.");
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                } else {
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
                    }
                    document.getElementById(event_id).style.display = 'none';
                    var msg_box = document.createElement("div");
                    var _class = document.createAttribute("class");
                    _class.value = "msg_box";
                    msg_box.attributes.setNamedItem(_class);
                    var close = document.createElement("span");
                    var _class = document.createAttribute("class");
                    _class.value = 'close1';
                    close.attributes.setNamedItem(_class);
                    var click_fun = document.createAttribute("onclick");
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode(response);
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                }
            }
        }
    }

    xmlhttp.open("POST", "restore_event_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("id=" + event_id);
}

function edit_event_func(event_id) {
    h_event_id = '#' + event_id;
    document.getElementById('e_msg').innerHTML = '';
    document.getElementById('e_msg').style.visibility = 'hidden';
    document.getElementById('e_upload1').value = '';
    document.getElementById('e_upload2').value = '';
    document.getElementById('e_upload3').value = '';
    document.getElementById('e_brief').value = document.getElementById('e_details').value = '';
    document.getElementById('event_id').value = event_id;
    document.getElementById('e_brief').value = document.querySelector(h_event_id + " .ent_cont .entries .brief").innerHTML;
    if (document.querySelector(h_event_id).contains(document.querySelector(h_event_id + " .preview"))) {
        preview_files = document.querySelector(h_event_id + " .preview").children;
        for (i = 0, len = preview_files.length, edit_text = ""; i < len; i++) {
            var file_id = preview_files[i].getAttribute('data-file-id');
            if (file_id == 1) {
                var file_ono = "First";
            }
            if (file_id == 2) {
                var file_ono = "Second";
            }
            if (file_id == 3) {
                var file_ono = "Third";
            }

            edit_text += "<div class='file_pare' id='file" + file_id + "'><h3 style='text-align: center;'>" + file_ono + " file.</h3>" + preview_files[i].outerHTML + "<div class='action_pare'><input type='checkbox' name='del_img" + file_id + "' id='del" + file_id + "' value='" + file_id + "'><label for='del" + file_id + "' class='del'>Delete this.</label></div></div>";
        }
        document.getElementById("e_preview").innerHTML = edit_text;
        document.getElementById("e_preview").style.display = 'flex';
    } else {
        document.getElementById("e_preview").innerHTML = '';
        document.getElementById("e_preview").style.display = 'none';
    }

    var dateofevent = document.querySelector(h_event_id + " .ent_cont .entries h6.dateofevent").getAttribute('data-value').split("-");
    var select = document.getElementById('e_year').children;
    for (i = 0; i < select.length; i++) {
        select[i].removeAttribute("selected");
        if (select[i].value == dateofevent[0]) {
            var sel = document.createAttribute("selected");
            select[i].attributes.setNamedItem(sel);
        }
    }

    var select = document.getElementById('e_month').children;
    for (i = 0; i < select.length; i++) {
        select[i].removeAttribute("selected");
        if (select[i].value == dateofevent[1]) {
            var sel = document.createAttribute("selected");
            select[i].attributes.setNamedItem(sel);
        }
    }

    var select = document.getElementById('e_day').children;
    for (i = 0; i < select.length; i++) {
        select[i].removeAttribute("selected");
        if (select[i].value == dateofevent[2]) {
            var sel = document.createAttribute("selected");
            select[i].attributes.setNamedItem(sel);
        }
    }

    document.getElementById('e_details').value = document.querySelector(h_event_id + " .ent_cont .entries .details").innerHTML.replace(/<br> /gi, "\n");
    // alert(document.querySelector(h_event_id + " .ent_cont .entries .details").innerHTML);
}

function evnt_fscreen(event_id) {
    event_id = '#' + event_id;
    document.getElementById('fscreen_brief').innerHTML = document.querySelector(event_id + " .ent_cont .entries .brief").innerHTML
    if (document.querySelector(event_id).contains(document.querySelector(event_id + " .preview"))) {
        document.getElementById('event_file').style.display = 'flex';
        document.getElementById('event_file').innerHTML = document.querySelector(event_id + " .preview").innerHTML;
        if (document.querySelector(event_id + " .preview").contains(document.querySelector(event_id + " .preview video"))) {
            var vids = document.querySelectorAll("#event_file video");
            vids.forEach(vid_func);
        }
    } else {
        document.getElementById('event_file').style.display = 'none';
        document.getElementById('event_file').innerHTML = '';
    }
    document.getElementById('fscreen_desc').innerHTML = document.querySelector(event_id + " .ent_cont .entries .details").innerHTML;
    document.getElementById('fscreen_dateofevent').innerHTML = document.querySelector(event_id + " .ent_cont .entries .dateofevent").innerHTML;
    // document.getElementById('fscreen_datetime').innerHTML = document.querySelector(event_id + " .ent_cont .entries .datetime").innerHTML;
    document.getElementById('fscreen_action').innerHTML = document.querySelector(event_id + " .ent_cont .action").innerHTML;
}

function fscreen(elmnt) {
    document.getElementById('fscreen').style.display = 'flex';
    document.getElementById('fscreen').scrollTo(0, 0);
    if (document.getElementById('fscreen').contains(document.getElementById('event_fscreen'))) {
        document.getElementById('event_fscreen').style.display = 'none';
    }
    if (document.getElementById('fscreen').contains(document.getElementById('n_event'))) {
        document.getElementById('n_event').style.display = 'none';
    }
    if (document.getElementById('fscreen').contains(document.getElementById('e_event'))) {
        document.getElementById('e_event').style.display = 'none';
    }
    elmnt.style.display = 'block';
}

function pagination_refresh_ajax(nav) {
    //hide fscreen , hide restore from trash btn
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                if (response.indexOf("Sorry, an error occured!") == -1 && response.indexOf("No more event!") == -1) {
                    document.getElementById('events').scrollTo(0, 0);
                    document.getElementById("events").innerHTML = response;
                } else {
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode(response);
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                }
            }
        }
    }

    xmlhttp.open("POST", "pagination_refresh_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("nav=" + nav);
}

function restore_trash(event_id) {
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
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                if (response.indexOf("done") != -1) {
                    document.querySelector('#' + event_id).parentNode.removeChild(document.querySelector('#' + event_id));
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
                    }
                    if (document.getElementById('events').innerHTML.trim() == '') {
                        document.getElementById('events').innerHTML = "<h1 class='text' id='text'>No event found in trash!</h1>";
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode("Restored successfully.");
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                } else {
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode(response);
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                }
            }
        }
    }

    xmlhttp.open("POST", "restore_event_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("id=" + event_id);
}

function delete_event(event_id) {
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
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                if (response.indexOf("done") != -1) {
                    document.querySelector('#' + event_id).parentNode.removeChild(document.querySelector('#' + event_id));
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
                    }
                    if (document.getElementById('events').innerHTML.trim() == '') {
                        document.getElementById('events').innerHTML = "<h1 class='text' id='text'>No event found in trash!</h1>";
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
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
                    var text = document.createTextNode("Deleted successfully!");
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                } else {
                    if (document.body.contains(document.querySelector('div.msg_box'))) {
                        document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));
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
                    click_fun.value = "document.querySelector('div.msg_box').parentNode.removeChild(document.querySelector('div.msg_box'));";
                    close.attributes.setNamedItem(click_fun);
                    var title = document.createAttribute("title");
                    title.value = "Close.";
                    close.attributes.setNamedItem(title);
                    // close.appendChild(document.createTextNode('X'));
                    close.innerHTML = '&times;';
                    msg_box.appendChild(close);
                    document.body.insertBefore(msg_box, document.body.childNodes[0]);

                    var text1 = document.createElement("p");
                    var _class = document.createAttribute("class");
                    _class.value = "text1";
                    text1.attributes.setNamedItem(_class);
                    var text = document.createTextNode(response);
                    text1.appendChild(text);
                    msg_box.appendChild(text1);
                }
            }
        }
    }

    xmlhttp.open("POST", "delete_event_script.php", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("id=" + event_id);
}
function search_ajax(event, val) {
    event.preventDefault();
    if (val.length < 1) {
        pagination_refresh_ajax('curr');
        return;
    }
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == '') {
                alert("Oops, i can't do anything, your session has expired!");
                return;
            } else {
                response = this.responseText.trim();
                document.getElementById('events').innerHTML = response;
            }
        }
    }
    var form_s = document.forms.namedItem("search");
    var data = new FormData(form_s);
    xmlhttp.open("POST", "search_script.php", true);
    xmlhttp.send(data);
}
