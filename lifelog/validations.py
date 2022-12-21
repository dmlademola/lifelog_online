import re, html
from lifelog.models import Error, User
from datetime import datetime
from django.urls import reverse
from django.core import validators, exceptions
from django.contrib.auth import hashers
from django.utils import safestring

# Validations Here
class Outcome:
    def __init__(self, success, message, err):
        self.success = success
        self.message = message
        self.err = err

    success: bool
    message: str
    err: bool


def profile(
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
):
    try:
        # fullname validation
        if not fullname:
            output = Outcome(False, "Your name was not given!", False)
            return output

        if len(html.unescape(fullname)) < 3:
            output = Outcome(False, "Your name must be at least 3 characters!", False)
            return output

        if len(html.unescape(fullname)) > 20:
            output = Outcome(
                False, "Your name must not be more than 20 characters!", False
            )
            return output

        if not re.fullmatch(r"[a-zA-Z\s]*$", fullname):
            output = Outcome(
                False, "Your name must only contain letters and whitespaces!", False
            )
            return output
        # fullname validation ends

        # gender validation
        if not gender:
            output = Outcome(False, "Select a gender!", False)
            return output

        if gender not in ["r", "m", "f"]:
            output = Outcome(False, "Select a valid gender!", False)
            return output
        # gender validation ends

        # date of birth validation
        try:
            datetime.strptime(dob, "%Y-%m-%d")
        except ValueError:
            output = Outcome(False, "Input a valid date of birth!", False)
            return output

        # date of birth validation ends

        # phone number validation
        if not phone_no:
            output = Outcome(False, "Input your phone number!", False)
            return output

        try:
            validators.validate_integer(phone_no)
        except exceptions.ValidationError:
            output = Outcome(
                False, "Phone number must have only numeric characters!", False
            )
            return output

        # phone number validation ends

        # email validation
        if not email:
            output = Outcome(False, "Input your email!", False)
            return output

        try:
            validators.validate_email(email)
        except exceptions.ValidationError:
            output = Outcome(False, "Input a valid email!", False)
            return output

        # email validation ends

        # username validation
        if not username:
            output = Outcome(False, "You need a username to be a valid user!", False)
            return output

        if not re.fullmatch(r"^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$", username):
            output = Outcome(
                False,
                "Username can only contain alphanumeric characters and underscores within them!",
                False,
            )
            return output

        if len(html.unescape(username)) < 5:
            output = Outcome(
                False, "Username must not have less than 5 characters!", False
            )
            return output

        if len(html.unescape(username)) > 20:
            output = Outcome(
                False, "Username must not have more than 20 characters!", False
            )
            return output

        if User.objects.filter(username=username, id=~req.session["userid"]).exists():
            output = Outcome(False, "Sorry, that username is already taken.", False)
            return output

        # username validation ends

        # theme validation
        if not theme:
            output = Outcome(False, "Select your preferred theme!", False)
            return output

        if theme not in ["light", "dark"]:
            output = Outcome(False, "Select a valid theme!", False)
            return output

        # theme validation ends

        # password validation
        if not password:
            output = Outcome(
                False, "You need to input your existing password to continue!", False
            )
            return output

        if not hashers.check_password(
            password, User.objects.get(id=req.session["userid"]).password
        ):
            output = Outcome(False, "That password is incorrect!", False)
            return output

        if not npassword:
            output = Outcome(True, "", False)
            return output

        if not cpassword:
            output = Outcome(False, "Confirm the new password!", False)
            return output

        if len(html.unescape(npassword)) < 6:
            output = Outcome(False, "Password must have at least 6 characters!", False)
            return output

        if len(html.unescape(npassword)) > 30:
            output = Outcome(
                False, "Password must not have more than 30 characters!", False
            )
            return output

        if npassword == password:
            output = Outcome(False, "Existing and new passwords must not match", False)
            return output

        if npassword != cpassword:
            output = Outcome(False, "New passwords do not match!", False)
            return output

        # password validation ends
        return Outcome(True, "", False)

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.validations.profile.profile() from " + reverse("profile"),
        )
        output = Outcome(False, "", True)
        return output


def signin(req, username, password):
    try:
        # fields not empty
        if not username:
            output = Outcome(False, "Username was not given!", False)
            return output

        if not password:
            output = Outcome(False, "Password was not given!", False)
            return output
        # fields not empty ends

        # real validation
        if User.objects.filter(username=username).exists() is not True:
            output = Outcome(
                False,
                safestring.mark_safe(
                    "User does not exist, <a href='"
                    + reverse("signup")
                    + "'>create a new account</a> instead."
                ),
                False,
            )
            return output

        if (
            hashers.check_password(
                password, User.objects.get(username=username).password
            )
            is not True
        ):
            output = Outcome(
                False,
                safestring.mark_safe(
                    "That password is incorrect, <a href='#'>have you forgotten it?</a>"
                ),
                False,
            )
            return output
        # real validation ends

        return Outcome(True, "", False)

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.validations.signin.signin() from " + reverse("signin"),
        )
        output = Outcome(False, "", True)
        return output


def signup(req, fullname, gender, dob, phone_no, email, username, password, cpassword):
    try:
        # fullname validation
        if not fullname:
            output = Outcome(False, "Your name was not given!", False)
            return output

        if len(html.unescape(fullname)) < 3:
            output = Outcome(False, "Your name must be at least 3 characters!", False)
            return output

        if len(html.unescape(fullname)) > 20:
            output = Outcome(
                False, "Your name must not be more than 20 characters!", False
            )
            return output

        if not re.fullmatch(r"[a-zA-Z\s]*$", fullname):
            output = Outcome(
                False, "Your name must only contain letters and whitespaces!", False
            )
            return output
        # fullname validation ends

        # gender validation
        if not gender:
            output = Outcome(False, "Select a gender!", False)
            return output

        if gender != "r" and gender != "m" and gender != "f":
            output = Outcome(False, "Select a valid gender!", False)
            return output
        # gender validation ends

        # date of birth validation
        try:
            datetime.strptime(dob, "%Y-%m-%d")
        except ValueError:
            output = Outcome(False, "Input a valid date of birth!", False)
            return output
        # date of birth validation ends

        # phone number validation
        if not phone_no:
            output = Outcome(False, "Input your phone number!", False)
            return output

        try:
            validators.validate_integer(phone_no)
        except exceptions.ValidationError:
            output = Outcome(
                False, "Phone number must have only numeric characters!", False
            )
            return output

        # phone number validation ends

        # email validation
        if not email:
            output = Outcome(False, "Input your email!", False)
            return output

        try:
            validators.validate_email(email)
        except exceptions.ValidationError:
            output = Outcome(False, "Input a valid email!", False)
            return output

        # email validation ends

        # username validation
        if not username:
            output = Outcome(False, "You need a username to be a valid user!", False)
            return output

        if not re.fullmatch(r"^[A-Za-z][A-Za-z0-9]*(?:_[A-Za-z0-9]+)*$", username):
            output = Outcome(
                False,
                "Username can only contain alphanumeric characters and underscores within them!",
                False,
            )
            return output

        if len(html.unescape(username)) < 5:
            output = Outcome(
                False, "Username must not have less than 5 characters!", False
            )
            return output

        if len(html.unescape(username)) > 20:
            output = Outcome(
                False, "Username must not have more than 20 characters!", False
            )
            return output

        if User.objects.filter(username=username).exists():
            output = Outcome(False, "Sorry, that username is already taken.", False)
            return output

        # username validation ends

        # password validation
        if not password:
            output = Outcome(
                False, "You need a password to secure your lifelog!", False
            )
            return output

        if not cpassword:
            output = Outcome(False, "Confirm your password to proceed!", False)
            return output

        if len(html.unescape(password)) < 6:
            output = Outcome(False, "Password must have at least 6 characters!", False)
            return output

        if len(html.unescape(password)) > 30:
            output = Outcome(
                False, "Password must not have more than 30 characters!", False
            )
            return output

        if password != cpassword:
            output = Outcome(False, "Passwords do not match!", False)
            return output

        # password validation ends
        return Outcome(True, "", False)

    except BaseException as Argument:
        Error.log_error(
            str(Argument),
            req,
            "lifelog.validations.signup.signup() from " + reverse("signup"),
        )
        output = Outcome(False, "", True)
        return output
