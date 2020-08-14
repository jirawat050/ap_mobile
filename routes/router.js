var express = require('express');
var router = express.Router();
var userCt = require('../controller/user');
var project = require('../controller/project');
var event = require('../controller/event');
var bodyParser = require('body-parser').json()

const {
  authenticate
} = require('../middleware');

router.get('/', function (req, res) {
    res.status(404).json({
      status: 404,
      "text": "PAGE NOT FOUND"
    });
  })
router.post('/news',bodyParser,event.register)
router.post('/register',bodyParser,userCt.register)
router.post('/project',bodyParser,project.addProject)
router.get('/project',project.getAll)
router.get('/user',userCt.getAll)
router.get('/user/news/:offset/:limit',authenticate(),bodyParser,userCt.getNews)
router.post('/login',userCt.login)
router.post('/user/read',authenticate(),bodyParser,userCt.readNews)

module.exports = router;