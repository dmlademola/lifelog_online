import os
from django.db import models
from django.utils import timezone
from datetime import date, datetime
from django.contrib.auth import hashers

# from lifelog.myutils import file_path

# Create your models here.


class User(models.Model):
    GENDERS = (
        ("m", "Male"),
        ("f", "Female"),
        ("r", "Rather not say"),
    )

    def create_user(req, fullname, gender, dob, phone_no, email, username, password):
        try:
            User(
                fullname=fullname,
                gender=gender,
                dob=dob,
                phone_no=phone_no,
                email=email,
                username=username,
                password=hashers.make_password(password),
            ).save()
            return True
        except BaseException as Argument:
            Error.log_error(
                str(Argument),
                req,
                "User.create_user()",
            )
            return False

    def update_user(
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
        try:
            User.objects.filter(id=req.session["userid"]).update(
                fullname=fullname,
                gender=gender,
                dob=dob,
                phone_no=phone_no,
                email=email,
                username=username,
                theme=theme,
                password=hashers.make_password(password),
            )
            return True
        except BaseException as Argument:
            Error.log_error(
                str(Argument),
                req,
                "User.update_user()",
            )
            return False

    img = models.ImageField(upload_to="profile_pics/", blank=True)
    fullname = models.CharField(max_length=100, blank=False)
    gender = models.CharField(max_length=1, choices=GENDERS, blank=False)
    dob = models.DateField(auto_now=False, auto_now_add=False, blank=False)
    phone_no = models.CharField(max_length=50, blank=True)
    email = models.EmailField(unique=True, blank=False)
    username = models.CharField(max_length=300, unique=True, blank=False)
    password = models.CharField(max_length=300, blank=False)
    theme = models.CharField(max_length=50, default="light")
    super_user = models.BooleanField(default=False)
    last_active = models.DateTimeField(default=timezone.now, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)


class Event(models.Model):
    def create_event(req, brief, details, upload_ids, date_of_event, happy_moment):
        try:
            Event(
                owner=req.session["userid"],
                upload_ids=upload_ids,
                brief=brief,
                details=details,
                date_of_event=date_of_event,
                happy_moment=happy_moment,
            ).save()
            return True
        except BaseException as Argument:
            Error.log_error(
                str(Argument),
                req,
                "Event.create_event()",
            )
            return False

    def update_event(
        req, event_id, brief, details, upload_ids, date_of_event, happy_moment
    ):
        try:
            Event.objects.filter(id=event_id).update(
                brief=brief,
                details=details,
                upload_ids=upload_ids,
                date_of_event=date_of_event,
                happy_moment=happy_moment,
            )
            return True
        except BaseException as Argument:
            Error.log_error(
                str(Argument),
                req,
                "Event.update_event()",
            )
            return False

    def trash_event(req, event_id):
        try:
            Event.objects.filter(id=event_id).update(trashed_on=datetime.now())
            return True
        except BaseException as Argument:
            Error.log_error(
                str(Argument),
                req,
                "Event.trash_event()",
            )
            return False

    owner = models.PositiveIntegerField()
    upload_ids = models.CharField(max_length=100000, blank=True)
    brief = models.CharField(max_length=150, blank=False)
    details = models.TextField(blank=False)
    date_of_event = models.DateField(auto_now=False, auto_now_add=False)
    happy_moment = models.BooleanField(default=True)
    time_added = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True, null=True)
    trashed_on = models.DateTimeField(blank=True, null=True)


class Upload(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    path = models.CharField(max_length=1000)
    caption = models.CharField(max_length=100, blank=True, null=False)
    file_type = models.CharField(max_length=50, default="pend")


class Password(models.Model):
    psw = models.CharField(max_length=50)
    time_gen = models.DateTimeField(auto_now_add=True)


class Error(models.Model):
    def log_error(error_str, req, more):
        err = Error(
            error_str=error_str,
            user_id=req.session.get("userid", False),
            referer=req.META.get("HTTP_REFERER", False),
            more=more,
        )
        err.save()

    error_str = models.TextField()
    user_id = models.TextField(blank=True)
    referer = models.CharField(max_length=1000)
    more = models.TextField(blank=True)
    resolved = models.BooleanField(default=False)
    time_gen = models.DateTimeField(auto_now_add=True)
