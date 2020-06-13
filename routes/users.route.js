var express = require('express');
var controller = require('../controllers/users.controller');
var validate = require('../validate/user.validate');


var router = express.Router();

router.get('/',controller.index);

router.post('/search',controller.search);

//router.get('/create',controller.create);

router.get('/:id?',controller.getid);

//router.post('/create',validate.postCreate,controller.postCreate);

router.post('/:id',controller.edit);

module.exports=router;