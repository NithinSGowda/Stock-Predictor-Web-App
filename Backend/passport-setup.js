const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var express = require('express');
const bodyParser = require('body-parser');
var User = require('./models/user');

var router = express.Router();
router.use(bodyParser.json());

passport.serializeUser(function(user, done) {
    /*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
    done(null, user.id);
  });
  
passport.deserializeUser(function(user, done) {
    /*
    Instead of user this function usually recives the id 
    then you use the id to select the user from the db and pass the user obj to the done callback
    PS: You can later access this data in any routes in: req.user
    */
    
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: "704651653001-a2tu0rtd5mo2sga6ce5pofgae2dt9j7c.apps.googleusercontent.com",
    clientSecret: "I0VfjQjWyzv0Pqmh0VvSUJEh",
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    /*
     use the profile info (mainly profile id) to check if the user is registerd in ur db
     If yes select the user and pass him to the done callback
     If not create the user and then select him and pass to callback
    */
    User.findOne({googleId: profile.id}, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        }
        else {
            user = new User({ username: profile.displayName });
            user.googleId = profile.id;
            user.firstname = profile._json.given_name;
            user.lastname = profile._json.family_name;
            user.image = profile._json.picture;
            user.email = profile._json.email;
            user.save((err, user) => {
                if (err)
                    return done(err, false);
                else
                    return done(null, user);
            })
        }
    });

    return done(null, profile);
  }
));