
  const {
    tokenSecretKey,
    tokenLife,
    refreshTokenSecretKey,
    refreshTokenLife
  } = require('../config/authen');
  const jwt = require('jsonwebtoken');
  module.exports = (options = {}) => {
    let token;
    return (req, res, next) => {
      setImmediate(function() {
        try {
          token = req.header("access-token");
          jwt.verify(token,tokenSecretKey, (err, data) => {
                if (err) {
                    res.status(401).json({ status : 401,"text" : "Unauthorized" });
                } 
                else{
                next();
                }
          });        
        } catch (ex) {
            res.status(401).json({ status : 401,"text" : "Unauthorized" });
        }
    });
        
    };
  };