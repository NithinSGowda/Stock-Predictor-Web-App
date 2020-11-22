const withAuth = require('../auth');
const express = require('express');
var User = require('../models/user');
var Stock = require('../models/user');
const bodyParser = require('body-parser')

const mainRouter = express.Router();
mainRouter.use(bodyParser.json());

mainRouter.route('/:sname')
.get((req, res, next)=>{
    res.statusCode=200;
    res.setHeader("Content-type","application/json");
    // var spawn = require("child_process").spawn; 

    // var process = spawn('python',["hello.py"] ); 
    // process.stdout.on('data', function(data) { 
    //     console.log("Came out");
    //     var stocks = data.toString(); 
    //     res.json(stocks);
    // }) 

    const {spawn} = require('child_process');
    const python = spawn('python', ['hello.py']);
    var dataToSend;
    // collect data from script
    python.stdout.on('data', function (data) {
        console.log('Pipe data from python script ...', dataToSend);
        dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        // send data to browser
        res.send(dataToSend)
    })


    // var stocks = new Array(60, 40, 90, 70, 85, 60, 75, 60, 90, 80, 110, 100)
    
})
module.exports = mainRouter;