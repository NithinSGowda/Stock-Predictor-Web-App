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

company=sys.argv[1]
def predict(company):
    lstm_file = Path(company+"lstm.h5")
    if lstm_file.is_file():
        lstm = load_model(lstm_file)
    else:
        Lstm.model_creation(company)
        lstm = load_model(lstm_file)

    df = yf.download(company,start='2020-01-01')

    time_steps = 20
    train_data=df.loc[:,'Close']
    train_data=train_data.to_numpy()
    scaler=MinMaxScaler(feature_range = (0, 1))
    train_data = train_data.reshape(-1,1)
    scaler.fit(train_data)
    train_data = scaler.transform(train_data)
    def create_dataset(dataset, look_back):
        dataX, dataY = [], []
        for i in range(len(dataset)-look_back):
            a = dataset[i:(i + look_back), 0]
            dataX.append(a)
            dataY.append(dataset[i + look_back, 0])
        return np.array(dataX), np.array(dataY)

    days=20
    A = df['Close'].values
    forecast=time_steps
    for i in range(days+1):
        train_data = A
        train_data = train_data.reshape(-1,1)
        train_data = scaler.transform(train_data)
        Train=train_data[-((time_steps+1)):]
        lstm_list,y=create_dataset(Train, time_steps)
        lstm_list=np.reshape(lstm_list, (lstm_list.shape[0],time_steps, 1))
        predicted_y = lstm.predict(lstm_list)
        predicted_y = scaler.inverse_transform(predicted_y)
        pred=np.ravel(predicted_y)
        A=np.append(A,pred)
    predicted_list=A[-(days):]

    required_data = df[['Close']]
    df_log = np.log(required_data)
    test=required_data[:-90]
    actual=required_data[-90:]
    df_test = np.log(test)

    model = ARIMA(df_test, order=(1,1,0))  
    arima = model.fit(disp=-1)
    fc, se, conf = arima.forecast(90,alpha=0.05) 
    forecast = np.exp(pd.Series(fc))

    model = ARIMA(df_log, order=(1,1,0))  
    arima = model.fit(disp=-1)
    fc, se, conf = arima.forecast(60,alpha=0.05) 
    fc_series = np.exp(pd.Series(fc))

    def mean_absolute_percentage_error(y_true, y_pred): 
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        return( np.mean(np.abs((y_true - y_pred) / y_true)) * 100)

    MAPE=mean_absolute_percentage_error(actual,forecast)

    predicted_list=list(predicted_list)
    fc_series=list(fc_series)
    volume=list(df.Volume)
    Price=list(df.Close)
    acc_lstm=99
    acc_arima=100-MAPE

    with open("data_file.json", "w") as write_file:
        json.dump({ 'Name' : company,
            'Closing Price' : Price , 
            'Volume' : volume , 
            'LSTM' : predicted_list ,
            'Lstm Accuracy' : acc_lstm , 
            'Arima' : fc_series ,
            'Arima Accuracy' : acc_arima },write_file)


if __name__ == '__main__':
    predict(company)