var express = require('express');
var controller = require('../controllers/register.controller');
var validate = require('../validate/user.validate');


var router = express.Router();


router.get('/create',controller.create);

router.post('/create',controller.postCreate);


module.exports=router;