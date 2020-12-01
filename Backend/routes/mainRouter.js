const express = require('express');
const uri = "mongodb+srv://stockapp:88888888@cluster0.o8iuu.mongodb.net/stockApp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
// const arraySchema = new Schema({ name: String });
const stockSchema = new mongoose.Schema({ Name: 'string', ClosingPrice: 'string', Volume: 'string', LSTM: 'string', LstmAccuracy: 'string', Arima: 'string', ArimaAccuracy: 'string' },{timestamps:true});
const stockModel = mongoose.model('stocks', stockSchema);
const bodyParser = require('body-parser')
const fs = require('fs');
var FuzzySearch = require('fuzzy-search');
var unirest = require('unirest');

const mainRouter = express.Router();
mainRouter.use(bodyParser.json());

mainRouter.route('/recent')
.get((req, res, next)=>{
    res.setHeader("Content-Type","applicaton/json");
    res.statusCode=200;   
    stockModel.find({}).sort('-updatedAt').limit(15).exec(function(err, doc){
        res.send(doc);
    })
})

mainRouter.route('/news/:stock')
.get((req, res, next)=>{
    res.setHeader("Content-Type","applicaton/json");
    res.statusCode=200;   
    var req = unirest('GET', 'https://newsapi.org/v2/everything?q='+req.params.stock+'&from=2020-11-15&sortBy=popularity&language=en&apiKey=4b82feb2582043058dfdfb45ead95157')
    .end(function (resNews) { 
        if (resNews.error) throw new Error(resNews.error); 
        res.send((resNews))
    });
})

mainRouter.route('/:sname')
.get((req, res, next)=>{
    res.setHeader("Content-Type","applicaton/json");
    res.statusCode=200;
    var stockName = (req.params.sname).toUpperCase();
    var JSONres=JSON.parse(fs.readFileSync('companies.json'))
    const searcher = new FuzzySearch(JSONres, [ 'symbol', 'description'], {
        caseSensitive: true,
        sort: true
      });
    var result = searcher.search(stockName);
    result=JSON.parse(JSON.stringify(result))
    if(result!=""){
    stockName=result[0].symbol
    var dateObj=new Date()
    dateObj.setDate(dateObj.getDate() - 1);  

    stockModel.find({ $query: {Name: stockName, createdAt: {$gt: dateObj}}, $orderby: { createdAt : -1 } }, function(err, doc){
        var obj = JSON.parse(JSON.stringify(doc));
        var resObj={}
        if(doc!=""){
            console.log("found in cache");
            resObj=obj[0];
            stockModel.update({_id: resObj._id}, {
                updatedAt: new Date()
            },(err, affected, resp)=>{console.log(resp);})
            resObj.ClosingPrice = (resObj.ClosingPrice).split(',')
            resObj.ClosingPrice = (resObj.ClosingPrice).map(x => parseFloat(x))
            resObj.Volume = (resObj.Volume).split(',')
            resObj.Volume = (resObj.Volume).map(x => parseFloat(x))
            resObj.LSTM = (resObj.LSTM).split(',')
            resObj.LSTM = (resObj.LSTM).map(x => parseFloat(x))
            resObj.LstmAccuracy = (resObj.LstmAccuracy).split(',')
            resObj.LstmAccuracy = (resObj.LstmAccuracy).map(x => parseFloat(x))
            resObj.Arima = (resObj.Arima).split(',')
            resObj.Arima = (resObj.Arima).map(x => parseFloat(x))
            resObj.ArimaAccuracy = (resObj.ArimaAccuracy).split(',')
            resObj.ArimaAccuracy = (resObj.ArimaAccuracy).map(x => parseFloat(x))
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
                if(code!=0){
                    console.log(91);
                    res.redirect("https://stockpredict.ml")
                }   
                else{
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
                } 
            })
        }
    });   
    }
    else{
        console.log(101);
        res.redirect("https://stockpredict.ml")
    } 
})

mainRouter.route('/full/:sname')
.get((req, res, next)=>{
    var stockName = (req.params.sname).toUpperCase();
    res.setHeader("Content-Type","applicaton/json");
    res.statusCode=200;
    var JSONres=JSON.parse(fs.readFileSync('companies.json'))
    const searcher = new FuzzySearch(JSONres, [ 'symbol', 'description'], {
        caseSensitive: true,
        sort: true
      });
    var result = searcher.search(stockName);
    result=JSON.parse(JSON.stringify(result))
    if(result!=""){
    stockName=result[0].symbol
   
    const {spawn} = require('child_process');
    const python = spawn('python3', ['PYTHON/chart.py',stockName]);

    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...');
    });

    python.on('close', (code) => {
        if(code!=0){
            console.log(130);
            res.redirect("https://stockpredict.ml")
        }
        console.log(`child process close all stdio with code ${code}`);
        obj=JSON.parse(fs.readFileSync('PYTHON/'+stockName+'prices.json'))
        res.send(obj)
    })  
}else{
    console.log(138);
    res.redirect("https://stockpredict.ml")
}
})

module.exports = mainRouter;
