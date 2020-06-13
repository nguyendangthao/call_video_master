var express = require('express');
var controller = require('../controllers/room.controller');
var validate = require('../validate/user.validate');


var router = express.Router();


router.get('/:id?',controller.getRoom);

router.post('/create',controller.createRoom);

router.post('/join',controller.joinRoom);

router.post('/out',controller.outRoom);

router.post('/getUsers',controller.showUsers);

router.post('/addUser',controller.addUser);

router.post('/search',controller.search);

module.exports=router;