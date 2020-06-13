var User = require('../models/user.model');

module.exports.requireAuth=function(req,res,next){
    //console.log(req.cookies,req.signedCookies);
    if(!req.session.userId){
        res.redirect('/auth/login');
        return;
    }
    //req.signedCookies.userId 
    User.findById(req.session.userId, 
        function(err,user) { 
            //console.log(user);
            if(err){
                console.log(err);
            }
            if(!user){
                res.redirect('/auth/login');
            }
            //res.locals.user = user;
            req.session.user= user;
            next();
        }
    );
    
};