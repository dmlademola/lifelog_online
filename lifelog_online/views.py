from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

def nav(req):
    return HttpResponse(
        "<!DOCTYPE html>"
        "<html>"
        "<body>"
        "That page does not exist<br />"
        "Do you want to open <a href='/lifelog/home'>Lifelog&copy;</a>?"
        "</body>"
        "</html>"
    )
