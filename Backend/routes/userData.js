const withAuth = require('../auth');
const express = require('express');
var User = require('../models/user');
const bodyParser = require('body-parser')

const userRouter = express.Router();
userRouter.use(bodyParser.json());

userRouter.route('/')
.post(withAuth, (req, res)=>{
    User.find({googleId : req.user})
    .then((user)=>{
      res.statusCode=200;
      res.setHeader("Content-type","application/json");
      res.json(user);
    },(err)=>next(err))
  });

module.exports = userRouter;
