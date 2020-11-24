const express = require('express');
const uri = "mongodb+srv://stockapp:88888888@cluster0.o8iuu.mongodb.net/stockApp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
// const arraySchema = new Schema({ name: String });
const stockSchema = new mongoose.Schema({ Name: 'string', ClosingPrice: 'string', Volume: 'string', LSTM: 'string', LstmAccuracy: 'string', Arima: 'string', ArimaAccuracy: 'string' },{timestamps:true});
const stockModel = mongoose.model('stocks', stockSchema);
const bodyParser = require('body-parser')
const fs = require('fs');


const mainRouter = express.Router();
mainRouter.use(bodyParser.json());

mainRouter.route('/:sname')
.get((req, res, next)=>{
    var stockName = (req.params.sname).toUpperCase();
    res.setHeader("Content-Type","applicaton/json");
    res.statusCode=200;
    var dateObj=new Date()
    dateObj.setDate(dateObj.getDate() - 1);  
    stockModel.find({ $query: {Name: stockName, updatedAt: {$gt: dateObj}}, $orderby: { updatedAt : -1 } }, function(err, doc){
        var obj = JSON.parse(JSON.stringify(doc));
        var resObj={}
        if(doc!=""){
            console.log("found in cache");
            resObj=obj[0];
            resObj.ClosingPrice = (resObj.ClosingPrice).split(',')
            resObj.ClosingPrice = (resObj.ClosingPrice).map(x => parseInt(x))
            resObj.Volume = (resObj.Volume).split(',')
            resObj.Volume = (resObj.Volume).map(x => parseInt(x))
            resObj.LSTM = (resObj.LSTM).split(',')
            resObj.LSTM = (resObj.LSTM).map(x => parseInt(x))
            resObj.LstmAccuracy = (resObj.LstmAccuracy).split(',')
            resObj.LstmAccuracy = (resObj.LstmAccuracy).map(x => parseInt(x))
            resObj.Arima = (resObj.Arima).split(',')
            resObj.Arima = (resObj.Arima).map(x => parseInt(x))
            resObj.ArimaAccuracy = (resObj.ArimaAccuracy).split(',')
            resObj.ArimaAccuracy = (resObj.ArimaAccuracy).map(x => parseInt(x))
            delete resObj._id
            delete resObj.__v
            res.send(resObj);
        }else{
            const {spawn} = require('child_process');
            const python = spawn('python3', ['PYTHON/final.py',stockName]);

            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
            });

            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);

                obj=JSON.parse(fs.readFileSync('PYTHON/'+stockName+'.json'))
                let obj2={}
                obj2.Name=obj.Name
                obj2.ClosingPrice=(obj.ClosingPrice).toString()
                obj2.Volume=(obj.Volume).toString()
                obj2.LSTM=(obj.LSTM).toString()
                obj2.LstmAccuracy=(obj.LstmAccuracy).toString()
                obj2.Arima=(obj.Arima).toString()
                obj2.ArimaAccuracy=(obj.ArimaAccuracy).toString()
                stockModel.create(obj2, function (err, objectInserted) {
                    if (err) return console.log(err);
                    console.log(objectInserted)
                    res.send(obj)
                });
            })
        }
    });    
})
module.exports = mainRouter;