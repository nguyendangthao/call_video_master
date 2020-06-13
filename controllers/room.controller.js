var Room = require('../models/room.model');
var User = require('../models/user.model');
var ObjectId = require('mongodb').ObjectId;

module.exports.getRoom=function(req,res){
    //var users = [];   
    User.findById(req.session.user.id)
    .exec(function(err,user){
        if (err) console.log(err);
        Room.findById(req.params.id)
        .exec(function(err,room){
            if (err) console.log(err);
            res.render('rooms/index',{
                room: room,
                messages: room.messages,
                members: room.members,
                listRoom: user.listRoom,
                user: user
        });
       // req.session.roomId = room.id;
    });
    });
    
    //console.log('User: ',user);
};

module.exports.createRoom=async function(req,res){
    // //Room.findOne({code:req.body.code},function(err,room){
    //     if(room){
    //         res.render('./users/index',{
    //             errors: [
    //                 'Code already exists!'
    //             ],
    //             values: req.body
    //         });
    //         return;
    //     }
        var newroom = new Room({
            name: req.body.name
            //code: req.body.code
        });
        var idUser=req.session.user.id;
        var newMem ={idMem: idUser, username: req.session.user.name};
        newroom.save(function(err, res) {
            if (err) throw err;
            console.log(res.name + " saved to rooms collection.");            
            //console.log('New Mem',newMem);
            var roomObj ={idroom: newroom.id, name: newroom.name};
            // them room vao user
            User.findByIdAndUpdate(idUser,{$push:{listRoom : roomObj}},{new:true},function(err,result){
                if (err) console.log('room',err);
                //console.log('update listRoom OK', result);
            });
            Room.findByIdAndUpdate(newroom.id,{$push:{members : newMem}},{new:true},function(err,result){
                if (err) console.log('user',err);
                //console.log("update members OK",result);
            });  
        });
        
        res.redirect('/rooms/'+newroom.id);
    //})
    
    //res.json(newroom);
};

module.exports.joinRoom= async function(req,res){
    var idUser=await req.session.user.id;
    var newMem =await {idMem: idUser, username: req.session.user.name};
    //console.log('New Mem',newMem);
    //var roomObj =await {idroom: room.id, name: newroom.name};
    await Room.findOneAndUpdate({_id: req.body.code}, {$push:{members: newMem}},{new:true}, function(err, room){
        if (err) console.log('Room not exist');
        console.log("update members OK",room);
        // them room vao user
        var roomObj = {idroom: room.id, name: room.name};
        User.findByIdAndUpdate(idUser,{$push:{listRoom : roomObj}},{new:true},function(err,result){
            if (err) console.log('room',err);
            console.log('update listRoom OK', result);
        });
        res.send('/rooms/'+room.id);
    });
    
};
module.exports.outRoom= async function(req,res){
    var idUser=await req.session.user.id;
    var newMem =await {idMem: idUser, username: req.session.user.name};
    //console.log('New Mem',newMem);
    //var roomObj =await {idroom: room.id, name: newroom.name};
    await Room.findOneAndUpdate({_id: req.body.roomId}, {$pull:{members: newMem}},{new:true}, function(err, room){
        if (err) console.log('Room not exist');
        console.log("update members OK",room);
        // them room vao user
        var roomObj = {idroom: room.id, name: room.name};
        User.findByIdAndUpdate(idUser,{$pull:{listRoom : roomObj}},{new:true},function(err,result){
            if (err) console.log('room',err);
            console.log('update listRoom OK', result);
        });
        res.send('/users');
    });
    
};
module.exports.addUser= async function(req,res){
    User.findOne({email: req.body.email},function(err,user){
        if(!user){
         res.send("Email not found!");
         return;
        }
        else{
            var newMem = {idMem: user.id, username: user.name};
            Room.findByIdAndUpdate(req.body.roomId, {$push:{members: newMem}},{new:true}, function(err, room){
                console.log("add members OK",room);
                // them room vao user
                var roomObj = {idroom: room.id, name: room.name};
                User.findByIdAndUpdate(user.id,{$push:{listRoom : roomObj}},{new:true},function(err,result){
                    console.log('update listRoom OK', result);
                    res.send('Success!');
                });
                
            });
        }
    })
    
    
};
    
module.exports.showUsers= function(req,res){
    Room.findOne({'name':'Room 1'},function(err,room){
        if(err) console.log("find err ", err);
        console.log(room);
        res.json(room.members);
    })
   
};
module.exports.search= function(req,res){
    User.find({
        //"listRoom.idroom": req.body.roomId,
        $or: [
            {name:{ "$regex": req.body.text, "$options": "i" }},
            {email:{ "$regex": req.body.text, "$options": "i" }}
        ]
        
    },function(err,users){
        if(err) console.log("find err ", err);
        res.json(users)
    })
   
};
