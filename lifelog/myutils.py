import html
import json
import re, os
from datetime import datetime
from random import randint
from lifelog.models import Upload, Event
from multiprocessing import Process
from lifelog import views
from lifelog_online.settings import MEDIA_ROOT

from django.utils import safestring, timezone
from lifelog_online import settings

# Helpers here


def user_is_loggedin(req):
    if req.session.get("userid", False) is False:
        return False

    return True


def date_gen(selected):
    # start date generation

    date = dict()

    # days of the month
    d = selected.strftime("%d")
    days = list()
    i = 1

    while i <= 31:
        if i < 10:
            i = "0" + str(i)

        if int(i) == int(d):
            day = '<option value="' + str(i) + '" selected>' + str(int(i)) + "</option>"
            days.append(safestring.mark_safe(day))
            i = int(i) + 1
            continue

        day = '<option value="' + str(i) + '">' + str(int(i)) + "</option>"
        days.append(safestring.mark_safe(day))
        i = int(i) + 1

    date["days"] = days
    # end days of the month

    # months of the year
    m = int(selected.strftime("%m"))
    months = list()
    index = {
        1: "January",
        2: "February",
        3: "March",
        4: "April",
        5: "May",
        6: "June",
        7: "July",
        8: "August",
        9: "September",
        10: "October",
        11: "November",
        12: "December",
    }

    i = 1

    while i <= 12:
        if int(i) < 10:
            i = "0" + str(i)

        if int(i) == int(m):
            month = (
                '<option value="' + str(i) + '" selected>' + index[int(i)] + "</option>"
            )
            months.append(safestring.mark_safe(month))
            i = int(i) + 1
            continue

        month = '<option value="' + str(i) + '">' + index[int(i)] + "</option>"
        months.append(safestring.mark_safe(month))
        i = int(i) + 1

    date["months"] = months

    # end months of the year

    # the years now
    year_now = int(datetime.now().strftime("%Y"))
    y = int(selected.strftime("%Y"))
    years = list()
    i = year_now

    while i >= (year_now - 100):
        if int(i) == int(y):
            year = '<option value="' + str(i) + '" selected>' + str(i) + "</option>"
            years.append(safestring.mark_safe(year))
            i = int(i) - 1
            continue

        year = '<option value="' + str(i) + '">' + str(i) + "</option>"
        years.append(safestring.mark_safe(year))
        i = int(i) - 1

    date["years"] = years
    # end the years now

    # end date generation
    return date


def uploads(upload_ids):
    upload_ids = json.loads(upload_ids)
    if len(upload_ids) == 0:
        return upload_ids
    uploads = list()
    for upload_id in upload_ids:
        upload = Upload.objects.get(id=upload_id)
        uploads.append(
            {"id": upload.id, "type": upload.file_type, "caption": upload.caption}
        )
    return uploads


def file_path(filename, dir):
    id = str()
    chars = (
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    )
    while len(id) < 10:
        id = id + chars[randint(0, (len(chars) - 1))]

    fname, fext = os.path.splitext(filename)
    fname = str(timezone.now()) + str(
        randint(
            1111111111111111111111111111111111111111,
            9999999999999999999999999999999999999999,
        )
    )

    if fext.lower() in (".jpg", ".png", ".gif", ".jpeg", ".jfif", ".bmp"):
        fname = "IMG_" + fname

    else:
        fname = "VID_" + fname

    for char in (" ", "-", ":", ".", "+"):
        fname = fname.replace(char, "")

    return (
        id,
        os.path.join(
            dir,
            fname + fext.lower(),
        ).replace("\\", "/"),
    )


def create_event(event, trash=False, format_only=False):
    lines = event["details"].split("<br />")
    text = det = str()
    for line in lines:
        if (len(text) + len(html.unescape(line))) > 100:
            det += html.escape(html.unescape(line)[: (100 - len(text))]) + "...<br />"
            break
        text += html.unescape(line)
        det += line + "<br />"

    event["details"] = det.removesuffix("<br />")
    event["upload_ids"] = len(json.loads(event["upload_ids"]))

    if format_only is True:
        return event

    e = "<div class='event' id='e" + str(event["id"]) + "'>"
    e += "<div class='ent_cont'>"
    if event["happy_moment"] is True:
        e += "<span class='happy_moment' title='Happy Moment'>😀</span>"
    e += "<div class='entries'>"
    e += "<p class='brief'>" + event["brief"] + "</p>"
    e += "<p class='details'>" + event["details"] + "</p>"
    e += "</div>"
    e += "<div class='action'>"
    if trash is False:
        e += "<span class='icon icon3 icon_20px edit' title='Edit'></span>"
        e += "<span class='icon icon4 icon_20px del' title='Move to Trash'></span>"
    else:
        e += "<span class='icon icon9 icon_20px res' title='Restore'></span>"
        e += (
            "<span class='icon icon4 icon_20px del' title='Delete permanently.'></span>"
        )
    e += "</div>"
    e += "</div>"
    e += "<div class='event_bottom'>"
    if event["upload_ids"] > 0:
        e += (
            "<span class='med_no' title='"
            + str(event["upload_ids"])
            + " file(s) added.'>(+"
            + str(event["upload_ids"])
            + ")</span>"
        )
    e += (
        "<h6 class='dateofevent'>"
        + event["date_of_event"].strftime("%A, %B %d, %Y")
        + "</h6>"
    )
    e += "</div>"
    e += "</div>"
    return e


def trim(string):
    # print(re.findall(r"\s+\n+", string))
    # string = re.sub(r"\s+\n+", "\n", string.strip())
    # string = re.sub(r"\s+\n+", "\n", string)
    return re.sub(r"\s+", " ", string.strip())


def delete_event(req, event_id):
    event = Event.objects.get(
        id=event_id, owner=req.session["userid"], trashed_on__isnull=False
    )

    upload_ids = json.loads(event.upload_ids)
    for upload_id in upload_ids:
        proc = Process(target=views.stream)
        proc.start()
        proc.terminate()
        os.unlink(os.path.join(MEDIA_ROOT, Upload.objects.get(id=upload_id).path))
        Upload.objects.get(id=upload_id).delete()

    Event.delete_event(req, event_id)
    return True
