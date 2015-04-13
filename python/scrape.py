import urllib
from bs4 import BeautifulSoup
import json
import time
import sys



subwayLine = sys.argv[1]
url = "http://subwaystats.com/status-" + subwayLine + "-train.html"

data = urllib.urlopen(url).read()
soup = BeautifulSoup(data)

items = soup.select("#content")

for item in items:
	title = item.select("h2")[0].text.strip()
	divs = soup.findAll("div", {"class" : "col-xs-12 col-sm-12 col-md-12 col-lg-12"})
	mess0 = divs[1].text.strip()
	mess1 = divs[2].text.strip()
	output = {"title": title, "mess0":mess0, "mess1":mess1}
	print json.dumps(output)
