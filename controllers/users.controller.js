var ObjectId = require('mongodb').ObjectId; 
var User = require('../models/user.model');
var Room = require('../models/room.model');
var md5 = require('md5');


module.exports.index=async function(req,res){
    //res.locals.user.id
    User.findById(req.session.user.id)
    .exec(function(err,user){
        if (err) console.log(err);
        res.render('users/index',{
            listRoom: user.listRoom,
            user: user
        })
    });
    
};

module.exports.search=function(req,res){
    //console.log(req.session.user.id);
    //console.log(req.body.text);
    Room.find({
        "members.idMem": req.session.user.id,
            name:{ "$regex": req.body.text, "$options": "i" }    
    },function(err,rooms){
        if(err) console.log("find err ", err);
        res.json(rooms)
    })
    
};

//module.exports.create=function(req,res){
//    res.render('users/create');//users/create.pug
//};

module.exports.getid=function(req,res){
    User.findById(req.params.id , 
        function(err,matchedUser) { 
            if(err){
                console.log(err);
            }
            res.render('users/profile',{
                user: matchedUser
            });
        }
    );
};


module.exports.edit=function(req,res){
    
    User.findByIdAndUpdate(req.params.id ,req.body,{new:true},function(err,result){
        if (err) console.log(err);
        res.redirect('back')//,{
                //user: result
            //});
        //res.json(result);
    })
};
