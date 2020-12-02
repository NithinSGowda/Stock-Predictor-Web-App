import sys
import os
import os.path
import json
import model as Lstm
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import keras
from keras.models import Sequential
from keras.models import load_model
from pathlib import Path
from statsmodels.tsa.arima_model import ARIMA
from statsmodels.tsa.arima_model import ARIMAResults
from sklearn import metrics
import datetime
import dateutil.relativedelta

company=sys.argv[1]
def predict(company):
    lstm_file = Path("PYTHON/"+company+"lstm.h5")
    if lstm_file.is_file():
        lstm = load_model(lstm_file)
    else:
        Lstm.model_creation(company)
        lstm = load_model(lstm_file)

    df = yf.download(company,start='2020-01-01')

    def forecastlstm(required_data,days):
        time_steps = 20
        required_data=required_data.to_numpy()
        scaler=MinMaxScaler(feature_range = (0, 1))
        required_data = required_data.reshape(-1,1)
        scaler.fit(required_data)
        required_data = scaler.transform(required_data)
        def create_dataset(dataset, look_back):
            dataX, dataY = [], []
            for i in range(len(dataset)-look_back):
                a = dataset[i:(i + look_back), 0]
                dataX.append(a)
                dataY.append(dataset[i + look_back, 0])
            return np.array(dataX), np.array(dataY)

        A = df['Close'].values
        forecast=time_steps
        for i in range(days+1):
            required_data = A
            required_data = required_data.reshape(-1,1)
            required_data = scaler.transform(required_data)
            Train=required_data[-((time_steps+1)):]
            lstm_list,y=create_dataset(Train, time_steps)
            lstm_list=np.reshape(lstm_list, (lstm_list.shape[0],time_steps, 1))
            predicted_y = lstm.predict(lstm_list)
            predicted_y = scaler.inverse_transform(predicted_y)
            pred=np.ravel(predicted_y)
            A=np.append(A,pred)
        predicted_list=A[-(days):]
        return predicted_list

    def forcast_arima(df,days):
        model = ARIMA(df, order=(1,1,0))  
        arima = model.fit(disp=-1)
        fc, se, conf = arima.forecast(days,alpha=0.05) 
        return(np.exp(pd.Series(fc)))

    def mean_absolute_percentage_error(y_true, y_pred): 
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        return( np.mean(np.abs((y_true - y_pred) / y_true)) * 100)

    required_data=df.loc[:,'Close']
    df.reset_index(inplace=True)
    df_log = np.log(required_data)
    test=required_data[:-90]
    actual=required_data[-90:]
    test_lstm=required_data[:-30]
    actual_lstm=required_data[-30:]
    df_test = np.log(test)
    predicted_list=forecastlstm(required_data,10)
    lstm_forecast= (forecastlstm(test_lstm,30))
    forecast = forcast_arima(df_test,90)
    fc_series = forcast_arima(df_log,60)
    MAPE_lstm=mean_absolute_percentage_error(actual_lstm,lstm_forecast)
    MAPE_arima=mean_absolute_percentage_error(actual,forecast)
    predicted_list=list(predicted_list)
    fc_series=list(fc_series)
    acc_lstm=100-np.mean(MAPE_lstm)
    acc_arima=100 - np.mean(MAPE_arima)

    v=list(df.tail(1).Close)
    df.reset_index(inplace=True)
    per = df.Date.dt.to_period("M")
    g = df.groupby(per)
    sum=(g.sum())
    volume=list(sum.tail(12).Volume)
    end=pd.datetime.now().date()-dateutil.relativedelta.relativedelta(months=1)
    start=end-dateutil.relativedelta.relativedelta(months=10)
    df1 = yf.download(company,start=start,end=end,interval='1mo')
    df1.dropna(inplace=True)
    Price=list(df1.Close)
    Price.append(v[0])
    Price.append(np.mean(predicted_list))


    with open("PYTHON/"+company+".json", "w") as write_file:
        json.dump({ 
            'Name' : company,
            'ClosingPrice' : Price , 
            'Volume' : volume , 
            'LSTM' : predicted_list ,
            'LstmAccuracy' : round(acc_lstm,2) , 
            'Arima' : fc_series ,
            'ArimaAccuracy' : round(acc_arima,2) 
    },write_file)


if __name__ == '__main__':
    predict(company)
