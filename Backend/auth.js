const jwt = require('jsonwebtoken');
var config = require('./config');
const cookieParser = require('cookie-parser');

const secret = config.secretKey;
const withAuth = function(req, res, next) {
  const token = req.body.token;
  console.log(token);
  if (!token) {
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.user = decoded.plod;
        next();
      }
    });
  }
}
module.exports = withAuth;