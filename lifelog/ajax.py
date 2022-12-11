import html
import json
import os
import re
from datetime import datetime

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.shortcuts import HttpResponse, HttpResponseRedirect, render
from django.urls import reverse
from django.utils import safestring
from django.db.models import Q
from lifelog import myutils, validations
from lifelog.models import *

# import django.core.files.uploadedfile

# Ajax Requests


def new_event(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )

        brief = req.POST["brief"]
        uploads = req.FILES.getlist("uploads")
        i = 0
        while i < len(uploads):
            uploads[i].caption = req.POST["caption" + str(i + 1)]
            i = i + 1
        date_of_event = myutils.trim(
            req.POST["year"] + "-" + req.POST["month"] + "-" + req.POST["day"]
        )
        if req.POST.get("happy_moment", False) == "on":
            happy_moment = True
        else:
            happy_moment = False

        details = req.POST["details"]

        if Event.objects.filter(
            owner=req.session["userid"],
            brief=myutils.trim(html.escape(brief)),
            details=myutils.trim(html.escape(details).replace("\n", "<br />")),
            date_of_event=date_of_event,
            happy_moment=happy_moment,
        ).exists():
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "This event already exists!",
                    }
                )
            )

        if not brief or not details:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "The brief and details fields can't be empty!",
                    }
                )
            )

        if len(myutils.trim(brief)) < 3:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your brief must have at least 3 characters!",
                    }
                )
            )

        if len(myutils.trim(brief)) > 30:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your brief must not have more than 30 characters!",
                    }
                )
            )

        if len(myutils.trim(details)) < 20:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your details must have at least 20 characters!",
                    }
                )
            )

        if len(myutils.trim(details)) > 8000:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your details must not have more than 8000 characters!",
                    }
                )
            )

        if happy_moment not in [True, False]:
            # print(happy_moment)
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Check the box if this was an happy moment and leave it if otherwise!",
                    }
                )
            )

        try:
            date_of_event = datetime.strptime(date_of_event, "%Y-%m-%d")
        except ValueError:
            return HttpResponse(
                json.dumps({"success": False, "message": "That date isn't valid!"})
            )

        if (
            datetime(
                int(date_of_event.strftime("%Y")),
                int(date_of_event.strftime("%m")),
                int(date_of_event.strftime("%d")),
            )
            > datetime.now()
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Date in the future. You can't be a time traveller!",
                    }
                )
            )

        if int(date_of_event.strftime("%Y")) < (
            int(datetime.now().strftime("%Y")) - 100
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Date out of range!",
                    }
                )
            )

        if len(uploads) > 9:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "The maximum number of files that can be uploaded is 9!",
                    }
                )
            )

        # check whether event happened in the future
        # print(uploads)
        for upload in uploads:
            fname = os.path.splitext(upload.name)[0][:20]
            fext = os.path.splitext(upload.name)[-1]
            if upload.name == (fname + fext):
                name = html.escape("'" + upload.name + "'")
            else:
                name = html.escape(
                    "'" + fname + ".." + fext[:5] + "'",
                )

            if upload:
                if len(myutils.trim(upload.caption)) > 20:
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Caption for "
                                + name
                                + " is too long, must not be more than 20 characters.",
                            }
                        )
                    )
                if upload.size < (1024 * 5):
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is too small, minimum size is 5kB!",
                            }
                        )
                    )
                if upload.size > (1024 * 1024 * 500):
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is too big, maximum size is 500mB!",
                            }
                        )
                    )

                if os.path.splitext(upload.name)[-1].casefold() not in [
                    ".jpg",
                    ".png",
                    ".gif",
                    ".jpeg",
                    ".jfif",
                    ".bmp",
                ] and os.path.splitext(upload.name)[-1].casefold() not in [
                    ".mp4",
                    ".webm",
                ]:
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is a file of unsupported format!",
                            }
                        )
                    )

        upload_ids = list()
        for upload in uploads:
            if upload:
                id, path = myutils.file_path(upload.name, "uploads")
                path = default_storage.save(path, upload)

                if os.path.splitext(path)[-1].lower() in (
                    ".jpg",
                    ".png",
                    ".gif",
                    ".jpeg",
                    ".jfif",
                    ".bmp",
                ):
                    file_type = "img"

                else:
                    file_type = "vid"

                Upload(
                    id=id,
                    path=path,
                    caption=myutils.trim(html.escape(upload.caption)),
                    file_type=file_type,
                ).save()
                upload_ids.append(id)

        upload_ids = json.dumps(upload_ids)

        if (
            Event.create_event(
                req,
                myutils.trim(html.escape(brief)),
                myutils.trim(html.escape(details).replace("\n", "<br />")),
                upload_ids,
                date_of_event,
                happy_moment,
            )
            is True
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": "Saved event successfully!",
                    }
                )
            )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )

    except BaseException as Argument:
        try:
            if upload_ids:
                for id in upload_ids:
                    os.unlink(id)
        except:
            pass

        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.new_event() from " + reverse("new_event_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )


def edit_event(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )
        event_id = req.POST["event_id"]
        brief = req.POST["brief"]
        uploads = req.FILES.getlist("uploads")
        i = 0
        while i < len(uploads):
            uploads[i].caption = req.POST["caption" + str(i + 1)]
            i = i + 1

        i = 0
        captions = list()
        while i < len(json.loads(Event.objects.get(id=event_id).upload_ids)):
            captions.append(req.POST["edit_cap" + str(i + 1)])
            i = i + 1

        date_of_event = myutils.trim(
            req.POST["year"] + "-" + req.POST["month"] + "-" + req.POST["day"]
        )
        if req.POST.get("happy_moment", False) == "on":
            happy_moment = True
        else:
            happy_moment = False

        details = req.POST["details"]

        if event_id.isnumeric() is False:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Sorry, an error occurred!",
                    }
                )
            )

        if not Event.objects.filter(
            id=event_id, owner=req.session["userid"], trashed_on__isnull=True
        ).exists():
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "That events does not exist!",
                    }
                )
            )

        if Event.objects.filter(
            ~Q(id=event_id),
            Q(owner=req.session["userid"]),
            Q(brief=myutils.trim(html.escape(brief))),
            Q(details=myutils.trim(html.escape(details).replace("\n", "<br />"))),
            Q(date_of_event=date_of_event),
            Q(happy_moment=happy_moment),
        ).exists():
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "A similar event exists!",
                    }
                )
            )

        if not brief or not details:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "The brief and details fields can't be empty!",
                    }
                )
            )

        if len(myutils.trim(brief)) < 3:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your brief must have at least 3 characters!",
                    }
                )
            )

        if len(myutils.trim(brief)) > 30:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your brief must not have more than 30 characters!",
                    }
                )
            )

        if len(myutils.trim(details)) < 20:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your details must have at least 20 characters!",
                    }
                )
            )

        if len(myutils.trim(details)) > 8000:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Your details must not have more than 8000 characters!",
                    }
                )
            )

        if happy_moment not in [True, False]:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Check the box if this was an happy moment and leave it if otherwise!",
                    }
                )
            )

        try:
            date_of_event = datetime.strptime(date_of_event, "%Y-%m-%d")
        except ValueError:
            return HttpResponse(
                json.dumps({"success": False, "message": "That date isn't valid!"})
            )

        if (
            datetime(
                int(date_of_event.strftime("%Y")),
                int(date_of_event.strftime("%m")),
                int(date_of_event.strftime("%d")),
            )
            > datetime.now()
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Date in the future. You can't be a time traveller!",
                    }
                )
            )

        if int(date_of_event.strftime("%Y")) < (
            int(datetime.now().strftime("%Y")) - 200
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Date out of range!",
                    }
                )
            )

        i = 0
        while i < len(captions):
            if captions[i]:
                if len(captions[i]) > 20:
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Your caption must not have more than 20 characters.",
                            }
                        )
                    )
            i = i + 1

        upload_ids = json.loads(Event.objects.get(id=event_id).upload_ids)
        if (len(uploads) + len(upload_ids)) > 9:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Total number of files uploaded has exceeded the maximum, 9!",
                    }
                )
            )

        # check whether event happened in the future
        for upload in uploads:
            fname = os.path.splitext(upload.name)[0][:20]
            fext = os.path.splitext(upload.name)[-1]
            if upload.name == (fname + fext):
                name = html.escape("'" + upload.name + "'")
            else:
                name = html.escape(
                    "'" + fname + ".." + fext[:5] + "'",
                )

            if upload:
                if len(myutils.trim(upload.caption)) > 20:
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Caption for "
                                + name
                                + " is too long, must not be more than 20 characters.",
                            }
                        )
                    )
                if upload.size < (1024 * 5):
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is too small, minimum size is 5kB!",
                            }
                        )
                    )
                if upload.size > (1024 * 1024 * 500):
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is too big, maximum size is 500mB!",
                            }
                        )
                    )

                if os.path.splitext(upload.name)[-1].casefold() not in [
                    ".jpg",
                    ".png",
                    ".gif",
                    ".jpeg",
                    ".jfif",
                    ".bmp",
                ] and os.path.splitext(upload.name)[-1].casefold() not in [
                    ".mp4",
                    ".webm",
                ]:
                    return HttpResponse(
                        json.dumps(
                            {
                                "success": False,
                                "message": "Sorry, "
                                + name
                                + " is a file of unsupported format!",
                            }
                        )
                    )

        i = 0
        while i < len(captions):
            if captions[i]:
                Upload.objects.filter(id=upload_ids[i]).update(
                    caption=myutils.trim(html.escape(captions[i]))
                )
            i = i + 1

        for upload in uploads:
            if upload:
                id, path = myutils.file_path(upload.name, "uploads")
                path = default_storage.save(path, upload)

                if os.path.splitext(path)[-1].lower() in (
                    ".jpg",
                    ".png",
                    ".gif",
                    ".jpeg",
                    ".jfif",
                    ".bmp",
                ):
                    file_type = "img"

                else:
                    file_type = "vid"

                Upload(
                    id=id,
                    path=path,
                    caption=myutils.trim(html.escape(upload.caption)),
                    file_type=file_type,
                ).save()
                upload_ids.append(id)

        upload_ids = json.dumps(upload_ids)

        if (
            Event.update_event(
                req,
                event_id,
                myutils.trim(html.escape(brief)),
                myutils.trim(html.escape(details).replace("\n", "<br />")),
                upload_ids,
                date_of_event,
                happy_moment,
            )
            is True
        ):
            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": "Saved changes to event successfully!",
                    }
                )
            )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )

    except BaseException as Argument:
        try:
            if upload_ids:
                for id in upload_ids:
                    os.unlink(id)
        except:
            pass

        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.edit_event() from " + reverse("edit_event_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )


def trash_event(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )
        event_id = req.GET["id"]

        if event_id.isnumeric() is False:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Sorry, an error occurred!",
                    }
                )
            )

        if not Event.objects.filter(
            id=event_id, owner=req.session["userid"], trashed_on__isnull=True
        ).exists():
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "That event does not exist!",
                    }
                )
            )

        if Event.trash_event(req, event_id) is True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": "Event moved to trash.",
                    }
                )
            )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.trash_event() from " + reverse("trash_event_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )


def pagination(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )
        nav = myutils.trim(req.GET["nav"])
        if nav not in ["next", "curr", "prev"]:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Invalid request received from client!",
                    }
                )
            )

        if nav == "next":
            start = 15 * (req.session["curr_home_page"] + 1)
        elif nav == "prev" and ((req.session["curr_home_page"] - 1) >= 0):
            start = 15 * (req.session["curr_home_page"] - 1)
        elif nav == "prev" and ((req.session["curr_home_page"] - 1) < 0):
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "No more event found.",
                    }
                )
            )
        else:
            start = 15 * req.session["curr_home_page"]

        events = (
            Event.objects.filter(owner=req.session["userid"], trashed_on__isnull=True)
            .values(
                "id",
                "brief",
                "details",
                "upload_ids",
                "date_of_event",
                "happy_moment",
            )
            .order_by("-date_of_event", "-time_added")[start : (start + 15)]
        )

        if len(events) == 0:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "No more event found.",
                    }
                )
            )
        else:
            event_str = str()
            for event in events:
                event_str += myutils.create_event(event)

            if nav == "next":
                req.session["curr_home_page"] += 1
            elif nav == "prev":
                req.session["curr_home_page"] -= 1

            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": event_str,
                    }
                )
            )

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.pagination() from " + reverse("pagination_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )


def search(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )

        s = myutils.trim(html.escape(req.POST["search_str"]))

        if re.fullmatch(
            r"(http://127.0.0.1:8000/lifelog/home/)+.*", req.META["HTTP_REFERER"]
        ):
            trashed_is_null = True
        elif re.fullmatch(
            r"(http://127.0.0.1:8000/lifelog/trash/)+.*", req.META["HTTP_REFERER"]
        ):
            trashed_is_null = False

        uploads = Upload.objects.filter(caption__icontains=s).values("id")
        u_query = Q()
        for upload in uploads:
            u_query = u_query | Q(upload_ids__icontains=upload["id"])

        results = list(
            Event.objects.filter(
                Q(owner=req.session["userid"]) & Q(trashed_on__isnull=trashed_is_null),
                Q(brief__icontains=s) | Q(details__icontains=s) | u_query,
            )
            .values(
                "id",
                "brief",
                "details",
                "upload_ids",
                "date_of_event",
                "happy_moment",
            )
            .order_by("-date_of_event", "time_added")
        )

        events = list()
        for res in results:
            if res not in events:
                events.append(res)

        if len(events) == 0:
            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": "<h1 id='text'>No matching events found.</h1>",
                    }
                )
            )

        else:
            event_str = str()
            for event in events:
                event_str += myutils.create_event(event)

            events = event_str

            return HttpResponse(
                json.dumps(
                    {
                        "success": True,
                        "message": events,
                    }
                )
            )

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.search() from " + reverse("search_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )


def get_event(req):
    try:
        if myutils.user_is_loggedin(req) is not True:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "You are not signed in!",
                    }
                )
            )

        event_id = req.GET["id"]
        edit = req.GET["e"]

        if event_id.isnumeric() is False:
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "Sorry, an error occurred!",
                    }
                )
            )

        if re.fullmatch(
            r"(http://127.0.0.1:8000/lifelog/home/)+.*", req.META["HTTP_REFERER"]
        ):
            trashed_is_null = True
        elif re.fullmatch(
            r"(http://127.0.0.1:8000/lifelog/trash/)+.*", req.META["HTTP_REFERER"]
        ):
            trashed_is_null = False

        if not Event.objects.filter(
            id=event_id, owner=req.session["userid"], trashed_on__isnull=trashed_is_null
        ).exists():
            return HttpResponse(
                json.dumps(
                    {
                        "success": False,
                        "message": "That events does not exist!",
                    }
                )
            )

        event = Event.objects.get(id=event_id)
        event = {
            "uploads": event.upload_ids,
            "brief": event.brief,
            "details": event.details,
            "date_of_event": event.date_of_event,
            "happy_moment": event.happy_moment,
        }

        if edit == "true":
            event["brief"] = html.unescape(event["brief"])
            event["details"] = html.unescape(event["details"].replace("<br />", "\n"))
            event["date_of_event"] = event["date_of_event"].strftime("%Y-%m-%d")
        else:
            event["date_of_event"] = event["date_of_event"].strftime("%A, %B %d, %Y")

        event["uploads"] = json.dumps(myutils.uploads(event["uploads"]))

        return HttpResponse(
            json.dumps(
                {
                    "success": True,
                    "message": json.dumps(event),
                }
            )
        )

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.ajax.get_event() from " + reverse("get_event_ajax"),
        )
        return HttpResponse(
            json.dumps(
                {
                    "success": False,
                    "message": "Sorry, an error occurred!",
                }
            )
        )
