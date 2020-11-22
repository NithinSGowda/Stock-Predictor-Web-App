const express = require('express');
const uri = "mongodb+srv://nithin:9481543420@cluster0.nnsbb.mongodb.net/stockApp?retryWrites=true&w=majority";
const mongoose = require('mongoose');
// const arraySchema = new Schema({ name: String });
const stockSchema = new mongoose.Schema({ name: 'string', arr1: 'string', arr2: 'string', arr3: 'string', arr4: 'string', accuracy: 'string' });
const stockModel = mongoose.model('stocks', stockSchema);
const bodyParser = require('body-parser')

const mainRouter = express.Router();
mainRouter.use(bodyParser.json());

mainRouter.route('/:sname')
.get((req, res, next)=>{

    stockModel.find({name: req.params.sname}, function(err, doc){
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
            const python = spawn('python', ['hello.py',req.params.sname]);
            var dataToSend;
            // collect data from script
            python.stdout.on('data', function (data) {
                console.log('Pipe data from python script ...', dataToSend);
                dataToSend = data.toString();
            });
            // in close event we are sure that stream from child process is closed
            python.on('close', (code) => {
                console.log(`child process close all stdio with code ${code}`);
                obj=JSON.parse(dataToSend)
                obj.arr1=(obj.arr1).toString()
                obj.arr2=(obj.arr2).toString()
                obj.arr3=(obj.arr3).toString()
                obj.arr4=(obj.arr4).toString()
                stockModel.create(obj, function (err, objectInserted) {
                    if (err) return console.log(err);
                    console.log(objectInserted)
                    res.send(dataToSend)
                });
            })
        }
    });    
})
module.exports = mainRouter;