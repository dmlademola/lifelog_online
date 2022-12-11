from lifelog.models import *

events = Event.objects.all()
for event in events:
    print(event["uploads"])
