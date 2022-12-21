from lifelog.models import *
import json

# events = Event.objects.all()
# for event in events:
#     up =json.loads(event.upload_ids)
#     for u in up:
upload = Upload.objects.all()
for up in upload:
    if not Event.objects.filter(id=18, upload_ids=up.id).exists():
        print(up.id)
["kev8ijml06", "04kpb234zr", "hfjec57v1y", "ga9dokupw6", "fp9zcbg15f", "hosp7f9asq", "wyh5xn3wfc"]
['kev8ijml06', '04kpb234zr', 'hfjec57v1y', 'ga9dokupw6',
'fp9zcbg15f', 'hosp7f9asq', 'wyh5xn3wfc']
