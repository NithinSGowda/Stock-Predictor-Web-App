import prediction as prd
import json
import sys

company=sys.argv[1]
prd.predict(company)
with open("data_file.json", "r") as read_file:
    data = json.load(read_file)
