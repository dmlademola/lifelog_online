import datetime
import html
import json
import mimetypes
import os
import re
from random import randint
from wsgiref.util import FileWrapper

from django.contrib import messages
from django.http import StreamingHttpResponse
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.utils import safestring

from lifelog import myutils, validations
from lifelog.models import Error, Event, Password, Upload, User
from lifelog_online.settings import MEDIA_ROOT

# Create your views here.


def redirect(req):
    return HttpResponseRedirect(reverse("signin"))


def signup_process(req):
    try:
        if req.session.get("theme", False) is not False:
            theme = req.session["theme"]
        else:
            theme = "light"

        if req.method == "POST":
            fullname = html.escape(req.POST["fullname"])
            gender = html.escape(req.POST["gender"])
            dob = html.escape(
                req.POST["year"] + "-" + req.POST["month"] + "-" + req.POST["day"]
            )
            # code = req.POST["country_code"]
            phone_no = html.escape(req.POST["phone_number"])
            email = html.escape(req.POST["email"])
            username = html.escape(req.POST["username"])
            password = req.POST["password"]
            cpassword = req.POST["cpassword"]

            output = validations.signup(
                req,
                fullname,
                gender,
                dob,
                phone_no,
                email,
                username,
                password,
                cpassword,
            )

            if output.err == True:
                return render(req, "error.html")

            if output.success == False:
                messages.info(
                    req,
                    safestring.mark_safe("<p class='err'>" + output.message + "</p>"),
                )
                fields = {
                    "fullname": fullname,
                    "gender": gender,
                    "dob": myutils.date_gen(
                        datetime.datetime(
                            int(req.POST["year"]),
                            int(req.POST["month"]),
                            int(req.POST["day"]),
                        )
                    ),
                    "phone_number": phone_no,
                    "email": email,
                    "username": username,
                }
                return render(req, "signup.html", {"fields": fields, "theme": theme})

            if User.create_user(
                req,
                fullname,
                gender,
                dob,
                phone_no,
                email,
                username,
                password,
            ):
                req.session["userid"] = User.objects.get(username=username).id
                req.session["newly_signed_in"] = True
                return HttpResponseRedirect(reverse("home"))
            else:
                return render(req, "error.html")

        else:
            date = myutils.date_gen(datetime.datetime.now())
            return render(req, "signup.html", {"date": date, "theme": theme})

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.signup_process() from " + reverse("signup"),
        )
        return render(req, "error.html")


def signin_process(req):
    try:
        if req.session.get("theme", False) is not False:
            theme = req.session["theme"]
        else:
            theme = "light"

        if myutils.user_is_loggedin(req) is True:
            messages.info(
                req,
                User.objects.get(id=req.session["userid"]).fullname
                + " was already signed in!",
            )
            return HttpResponseRedirect(reverse("home"))

        if req.method == "POST":
            username = req.POST["username"]
            password = req.POST["password"]

            output = validations.signin(req, username, password)

            if output.err == True:
                return render(req, "error.html")

            if output.success == False:
                messages.info(
                    req,
                    safestring.mark_safe("<p class='err'>" + output.message + "</p>"),
                )
                if req.POST.get("continue", False) is not False:
                    return render(
                        req,
                        "signin.html",
                        {
                            "username": username,
                            "theme": theme,
                            "continue": req.POST["continue"],
                        },
                    )

                else:
                    return render(
                        req,
                        "signin.html",
                        {"username": username, "theme": theme},
                    )

            if User.objects.filter(username=username).update(
                last_active=datetime.datetime.now()
            ):
                user = User.objects.get(username=username)
                req.session["userid"] = user.id
                req.session["theme"] = user.theme
                req.session["newly_signed_in"] = True

                if (
                    req.POST.get("continue", False) is not False
                    and req.POST.get("continue", False) != ""
                ):
                    return HttpResponseRedirect(req.POST["continue"])
                else:
                    return HttpResponseRedirect(reverse("home"))

            else:
                return render(req, "error.html")

        else:
            if req.GET.get("continue", False) is not False:
                return render(
                    req,
                    "signin.html",
                    {"continue": req.GET["continue"], "theme": theme},
                )
            else:
                return render(req, "signin.html", {"theme": theme})

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.signin_process() from " + reverse("signin"),
        )
        return render(req, "error.html")


def home(req):
    # try:
    if myutils.user_is_loggedin(req) is not True:
        messages.info(
            req,
            safestring.mark_safe(
                "<p id='msg' style='visibility: visible'>You have to sign in first!</p>"
            ),
        )
        return HttpResponseRedirect(reverse("signin") + "?continue=" + reverse("home"))

    userid = req.session["userid"]
    req.session["curr_home_page"] = 0
    heads = dict()
    heads["theme"] = req.session["theme"]
    if req.session.get("newly_signed_in", False) is not False:
        heads["newly_signed_in"] = True
        del req.session["newly_signed_in"]

    events = (
        Event.objects.filter(owner=userid, trashed_on__isnull=True)
        .values(
            "id",
            "brief",
            "details",
            "upload_ids",
            "date_of_event",
            "happy_moment",
        )
        .order_by("-date_of_event", "time_added")[0:15]
    )

    for event in events:
        event = myutils.create_event(event, format_only=True)

    date = myutils.date_gen(datetime.datetime.now())

    return render(
        req,
        "home.html",
        {"heads": heads, "events": events, "date": date},
    )


# except BaseException as Argument:
#     Error.log_error(
#         str(Argument),
#         req,
#         "lifelog.home() from " + reverse("home"),
#     )
#     return render(req, "error.html")


def signout(req):
    try:
        if req.session.get("userid", False) is not False:
            del req.session["userid"]
            messages.info(
                req,
                safestring.mark_safe(
                    "<p id='msg' style='visibility: visible'>You have been signed out!</p>"
                ),
            )
        else:
            messages.info(
                req,
                safestring.mark_safe(
                    "<p id='msg' style='visibility: visible'>You were not signed in!</p>"
                ),
            )

        return HttpResponseRedirect(reverse("signin"))

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.signout() from " + reverse("signout"),
        )
        return render(req, "error.html")


def trash(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            messages.info(
                req,
                safestring.mark_safe(
                    "<p id='msg' style='visibility: visible'>You have to sign in first!</p>"
                ),
            )
            return HttpResponseRedirect(
                reverse("signin") + "?continue=" + reverse("trash")
            )

        userid = req.session["userid"]
        req.session["curr_trash_page"] = 0
        heads = dict()
        heads["theme"] = req.session["theme"]
        if req.session.get("newly_signed_in", False) is not False:
            heads["newly_signed_in"] = True
            del req.session["newly_signed_in"]

        events = (
            Event.objects.filter(owner=userid, trashed_on__isnull=False)
            .values(
                "id",
                "brief",
                "details",
                "upload_ids",
                "date_of_event",
                "happy_moment",
            )
            .order_by("-date_of_event", "time_added")[0:15]
        )

        for event in events:
            event = myutils.create_event(event, trash=True, format_only=True)

        return render(req, "trash.html", {"heads": heads, "events": events})

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.trash() from " + reverse("trash"),
        )
        return render(req, "error.html")


def profile_process(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            messages.info(
                req,
                safestring.mark_safe(
                    "<p id='msg' style='visibility: visible'>You have to sign in first!</p>"
                ),
            )
            return HttpResponseRedirect(
                reverse("signin") + "?continue=" + reverse("profile")
            )

        userid = req.session["userid"]
        user = User.objects.get(id=userid)
        heads = dict()
        heads["theme"] = req.session["theme"]
        if req.session.get("newly_signed_in", False) is not False:
            heads["newly_signed_in"] = True
            del req.session["newly_signed_in"]

        if req.method == "POST":
            fullname = html.escape(req.POST["fullname"])
            gender = html.escape(req.POST["gender"])
            dob = html.escape(
                req.POST["year"] + "-" + req.POST["month"] + "-" + req.POST["day"]
            )
            phone_no = html.escape(req.POST["phone_no"])
            email = html.escape(req.POST["email"])
            username = html.escape(req.POST["username"])
            theme = html.escape(req.POST["theme"])
            password = req.POST["password"]
            npassword = req.POST["npassword"]
            cpassword = req.POST["cpassword"]

            output = validations.profile(
                req,
                fullname,
                gender,
                dob,
                phone_no,
                email,
                username,
                theme,
                password,
                npassword,
                cpassword,
            )

            if output.err == True:
                return render(req, "error.html")

            if output.success == False:
                messages.info(
                    req,
                    safestring.mark_safe("<p class='err'>" + output.message + "</p>"),
                )
                fields = {
                    "fullname": fullname,
                    "gender": gender,
                    "dob": myutils.date_gen(
                        datetime.datetime(
                            int(req.POST["year"]),
                            int(req.POST["month"]),
                            int(req.POST["day"]),
                        )
                    ),
                    "phone_no": phone_no,
                    "email": email,
                    "username": username,
                    "theme": theme,
                }
                return render(req, "profile.html", {"user": user, "fields": fields})

            if npassword:
                password = npassword

            if User.update_user(
                req,
                fullname,
                gender,
                dob,
                phone_no,
                email,
                username,
                theme,
                password,
            ):
                messages.info(
                    req,
                    safestring.mark_safe(
                        "<p class='suc'>User details saved successfully</p>"
                    ),
                )
                req.session["theme"] = theme
                return HttpResponseRedirect(reverse("profile"))
            else:
                return render(req, "error.html")

        user.dob = myutils.date_gen(user.dob)

        return render(req, "profile.html", {"user": user})

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.profile_process() from " + reverse("profile"),
        )
        return render(req, "error.html")


def stream(req):
    try:
        file_id = html.escape(req.GET["id"])
        e = Event.objects.filter(
            owner=req.session["userid"], upload_ids__icontains=file_id
        ).exists()
        if e is not True:
            return HttpResponse("Sorry, an error occurred!")
        # print(file_id + "\n")
        path = os.path.join(MEDIA_ROOT, Upload.objects.get(id=file_id).path)
        size = os.path.getsize(path)
        content_type, encoding = mimetypes.guess_type(path)
        content_type = content_type or "application/octet-stream"
        file = open(path, "rb")

        res = StreamingHttpResponse(
            FileWrapper(file),
            content_type=content_type,
            status=200,
        )

        res["Content-Length"] = str(size)
        res["Accept-Ranges"] = "bytes"
        return res
    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.stream() from " + reverse("stream"),
        )
        return render(req, "error.html")


def admin(req):
    try:
        errs = Error.objects.all().order_by("-time_gen")
        for err in errs:
            if err.user_id and err.user_id != "False":
                err.user_id = (
                    User.objects.get(id=err.user_id).fullname
                    + "(id "
                    + err.user_id
                    + ")"
                )

            else:
                err.user_id = "None"
        # errs.delete()

        return render(req, "admin/ndex.html", {"errs": errs})

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.admin() from " + reverse("admin"),
        )
        return render(req, "error.html")


# plugins*****
def psw_gen(req):
    chars = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
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
        "`",
        "~",
        "!",
        "@",
        "#",
        "$",
        "%",
        "^",
        "&",
        "*",
        "(",
        ")",
        "_",
        "-",
        "+",
        "=",
        "{",
        "[",
        "}",
        "]",
        "|",
        "\\",
        ":",
        ";",
        '"',
        "'",
        "<",
        ",",
        ">",
        ".",
        "?",
        "/",
        " ",
    ]

    string = ""
    while len(string) < 8:
        string = string + chars[randint(0, (len(chars) - 1))]

    password = Passwords(psw=string)
    password.save()

    passwords = Password.objects.all().order_by("-id")

    return render(req, "psw_gen.html", {"password": string, "passwords": passwords})


def psw_del(req, id):
    if id == "all":
        password = Password.objects.all()
        password.delete()
    else:
        password = Password.objects.get(id=id)
        password.delete()

    return HttpResponseRedirect(reverse("psw_gen"))
