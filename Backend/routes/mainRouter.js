const express = require('express');
const uri = "mongodb+srv://stockapp:88888888@cluster0.o8iuu.mongodb.net/stockApp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
// const arraySchema = new Schema({ name: String });
const stockSchema = new mongoose.Schema({ name: 'string', arr1: 'string', arr2: 'string', arr3: 'string', arr4: 'string', accuracy: 'string' });
const stockModel = mongoose.model('stocks', stockSchema);
const bodyParser = require('body-parser')
const fs = require('fs');


const mainRouter = express.Router();
mainRouter.use(bodyParser.json());

mainRouter.route('/:sname')
.get((req, res, next)=>{
    var stockName = (req.params.sname).toUpperCase();

    stockModel.find({name: stockName}, function(err, doc){
        var obj = JSON.parse(JSON.stringify(doc));
        res.statusCode=200;
        var resObj={}
        res.setHeader("Content-Type","applicaton/json");
        if(doc!=""){
            console.log("found in cache");
            resObj=obj[0];
            resObj.arr1 = (resObj.arr1).split(',')
            resObj.arr1 = (resObj.arr1).map(x => parseInt(x))
            resObj.arr2 = (resObj.arr2).split(',')
            resObj.arr2 = (resObj.arr2).map(x => parseInt(x))
            resObj.arr3 = (resObj.arr3).split(',')
            resObj.arr3 = (resObj.arr3).map(x => parseInt(x))
            resObj.arr4 = (resObj.arr4).split(',')
            resObj.arr4 = (resObj.arr4).map(x => parseInt(x))
            delete resObj._id
            delete resObj.__v

            res.send(resObj);
        }else{
            const {spawn} = require('child_process');
            const python = spawn('python', ['PYTHON/final.py',stockName]);
            var dataToSend;

            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...');
            });

            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);

                obj=JSON.parse(fs.readFileSync('PYTHON/data_file.json'))
                let obj2={}
                obj.arr1=(obj.arr1).toString()
                obj.arr2=(obj.arr2).toString()
                obj2.Arima=(obj.Arima).toString()
                obj2.Volume=(obj.Volume).toString()
                // stockModel.create(obj, function (err, objectInserted) {
                //     if (err) return console.log(err);
                //     console.log(objectInserted)
                //     res.send(obj)
                // });
                res.send(obj)
            })
        }
    });    
})
module.exports = mainRouter;