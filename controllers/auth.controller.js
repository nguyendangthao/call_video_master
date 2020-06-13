var User = require('../models/user.model');
var md5 = require('md5');

module.exports.login=function(req,res){
    res.render('auth/login');
};

module.exports.postLogin=function(req,res){
    var email=req.body.email;
    var password=req.body.password;
    User.findOne({email: email},function(err,user){
        if(!user){
            res.render('auth/login',{
                errors: [
                    'User does not exist!'
                ],
                values: req.body
            });
            return;
        }   
        var hashedPassword = md5(password);
        if(user.password !== hashedPassword){
            res.render('auth/login',{
                errors: [
                    'Wrong password!'
                ],
                values: req.body
            });
            return;
        }
        req.session.userId=user.id;
        res.redirect('/users');
    });
    
};

module.exports.logout=function(req,res){
    //res.clearCookie('userId');
    res.redirect('/');
};