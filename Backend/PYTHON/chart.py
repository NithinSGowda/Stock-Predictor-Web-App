import pandas as pd
import yfinance as yf
import sys
from datetime import datetime

company=sys.argv[1]
df = yf.download(company,start='2020-01-01')
df.reset_index(inplace=True)
df['Date']=df['Date'].astype(str)
df.to_json(company+"prices.json",orient='records',date_format = 'iso')