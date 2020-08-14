const User = require('../model/user.js')
const { Validator } = require('node-input-validator');
const jwt_decode = require('jwt-decode');
const {
  tokenSecretKey,
  tokenLife,
  refreshTokenSecretKey,
  refreshTokenLife
} = require('../config/authen');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const moment = require('moment-timezone');

function getDate(){
  // moment.tz.add({ timezone: config.server.timezone });
   return moment().format('YYYY-MM-DD HH:mm:ss');
 }
const generateToken = (id, tokenIsCreated) => {
  // moment.tz.add({ timezone: config.server.timezone });
   let isCreated = tokenIsCreated ? true : false;
   let dt =getDate();;
   let payload = {
     dt: dt,
     token: isCreated
       ? jwt.sign({ id: id }, tokenSecretKey, {
           expiresIn:  '1h'
           //tokenLife * 1000
         })
       : null,
     refresh_token: isCreated ? uuidv4() : null,
     refresh_token_iat: isCreated ? dt : null,
     refresh_token_exp: isCreated
       ? moment()
           .add(refreshTokenLife * 1000)
           .format('YYYY-MM-DD HH:mm:ss')
       : null
   };
   return payload;
 };
exports.login = (req, res) => {
  const user = new User({
      username: req.body.username,
      password: req.body.password,
  })
  const v = new Validator (user, {
      username: 'required|email',
      password: 'required',

  });
  v.check().then((matched) => {
    if (!matched) {
      res.status(422).send(v.errors);
    }
  });
  User.login(user, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
            err.message || 'Some error occurred while Login the User.'
      })
    } else {
      
      if(data.Status === 500){
          res.send(data)
      }
      else{
        (async () => {
          let payload = await generateToken(data[0].id, true);
          await User.logLogin(data[0].id, payload, (err, resultLog) => {
              if (err) {
              console.log(err)
              } else {
                  data[0].access_token = payload.token;
                  data[0].refresh_token = payload.refresh_token;
                  data[0].last_login = payload.dt;
                  res.send(data)
              }
          });
        })();
      }

      // res.send(data)
    }
  })
}
exports.register = (req, res) => {
    if (!req.body) {
        res.status(400).send({
          message: 'Content can not be empty!'
        })
    }
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        tel: req.body.tel,
        project_id: req.body.project_id,

    })
    const v = new Validator (user, {
        username: 'required|email',
        password: 'required',
        project_id: 'required|integer',
        first_name: 'required',
        last_name: 'required',
        tel : 'required'
    });
    v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      });
      User.register(user, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
                err.message || 'Some error occurred while register the User.'
          })
        } else res.send(data)
    })
}

exports.getAll = (req, res) => {
    User.getAll((err, data) => {
        console.log("data",data)
        if (err) {
            res.status(404).json({
                status: 404,
                "text": "PAGE NOT FOUND"
        });
        } else  res.send(data)
      })
}
exports.readNews = (req, res) => {
    const user = new User({
        user_id: req.body.user_id,
        event_id: req.body.event_id
    })
    let token = req.header("access-token");
    let data_raw =jwt_decode(token)
    console.log("data_id",data_raw.id)
    if(data_raw.id !== user.user_id){
      res.status(500).send({
        message: 'token is not valid in user_id.'
      })
    }
    const v = new Validator (user, {
        user_id: 'required|integer',
        event_id: 'required|integer'
    });
    v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
    });
    User.readNews(user, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
                err.message || 'Some error occurred while register the User.'
          })
        } else res.send(data)
    })
}
exports.getNews = (req, res) => {
    if (!req.body) {
        res.status(400).send({
          message: 'Content can not be empty!'
        })
    }
    const user = new User({
        limit: req.params.limit,
        offset: req.params.offset,
        user_id: req.body.user_id

    })
    let token = req.header("access-token");
    let data_raw =jwt_decode(token)
    if(data_raw.id !== user.user_id){
      res.status(500).send({
        message: 'token is not valid in user_id.'
      })
    }

  
    const v = new Validator (user, {
        user_id: 'required',
        limit: 'required|integer',
        offset: 'required|integer'
    });
    v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      });
      User.getNews(user, (err, data) => {
        if (err) {
          res.status(500).send({
            message:
                err.message || 'Some error occurred while register the User.'
          })
        } else res.send(data)
    })
}