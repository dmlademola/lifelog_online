import json

# s = "{'first', 'second'}"
s = "['hej', 'kduij']"
print(json.loads(s), type(json.loads(s)))
