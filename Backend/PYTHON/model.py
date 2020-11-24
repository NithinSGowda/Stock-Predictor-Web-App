import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import keras
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from keras.layers import Dropout
from keras.models import load_model

company=sys.argv[1]

def model_creation(company):
	df = yf.download(company,start='2020-01-01')
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
	    
	    
	# Create the data to train our model on:
	time_steps = 20
	X_train, y_train = create_dataset(train_data, time_steps)

	# reshape it [samples, time steps, features]
	X_train = np.reshape(X_train, (X_train.shape[0], time_steps, 1))

	# Build the model 
	model = Sequential()
	model.add(LSTM(units = 50, return_sequences = True, input_shape = (X_train.shape[1], 1)))
	model.add(Dropout(0.2))
	model.add(LSTM(units = 50, return_sequences = True))
	model.add(Dropout(0.2))
	model.add(LSTM(units = 50, return_sequences = True))
	model.add(Dropout(0.2))
	model.add(LSTM(units = 50))
	model.add(Dropout(0.2))
	model.add(Dense(units = 1))

	#Compiling and fitting the model
	model.compile(optimizer = 'adam', loss = 'mean_squared_error')
	model.fit(X_train, y_train, epochs = 25, batch_size = 32)
	model.save(company+"lstm.h5")

if __name__ == '__main__':
    model_creation(company)