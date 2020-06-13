require('dotenv').config();

const app = require('./app');
var server = require("http").Server(app);
var io = require("socket.io")(server);


var mongoose = require('mongoose');


var Room = require('./models/room.model');
var User = require('./models/user.model');


// call, share. record
let stream = require('./ws/stream');
let path = require('path');
let favicon = require('serve-favicon')
app.use(favicon(path.join(__dirname, 'favicon.ico')));
io.of('/stream').on('connection', stream);
// and call, share. record
//app.use(SocketIOFileUpload.router);

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once("open", () => {
    console.log("MongoDB Connected!");
});


io.on('connection', (socket) => {
    // var uploader = new SocketIOFile(socket, {
	// 	uploadDir: '/uploads',							// simple directory		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg'
	// 	maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit)
	// 	chunkSize: 10240,							// default is 10240(1KB)
	// 	transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay)
	// 	overwrite: true 							// overwrite file if exists, default is true.
	// });
    //console.log(socket.adapter.rooms);
    //console.log("co nguoi ket noi"+ socket.id);
    socket.on("client-login", function (data) {
        socket.email = data;
        console.log(data, " Login thanh cong");
        //console.log(res.locals.user.name);
    });
    socket.on("create-room", function (data) {
        socket.join(data);
        socket.Room = data
        console.log("Room vua them", data);
    });
    socket.on("user-join-room", function (data) {
        //socket.leave(data.currRoom);
        socket.join(data.nextRoom);
        socket.Room = data.nextRoom.toString();
        console.log(socket.adapter.rooms);
        //io.sockets.emit("server-send-user-join-room", );
        /*User.find({"listRoom.name": room},function(err,users){
            if(err) console.log("error");
            //console.log("list user ",users);
            users.forEach(user =>{
                //console.log("name ",user);
                socket.emit("server-send-user-join-room", user.name);
            });        
        });*/

    });
    //console.log("Room",socket.Room);
    socket.on("user-send-message", function (messObj) {
        //socket.join(messObj.room);
        //socket.Room=messObj.room;
        var message = {
            text: messObj.text,
            nameUser: messObj.nameUser,
            time: messObj.time,
            
        };
        //console.log(message);
        //console.log(messObj.room);
        Room.findByIdAndUpdate(messObj.room, { $push: { messages: message } }, { new: true }, function (err, res) {
            if (err) console.log(err);
            console.log(res);
        });
        //io.in(socket.Room).emit('server-send-message', message);
        //io.sockets.in(socket.Room).emit("server-send-message",message);
        /*User.find({"listRoom.name": messObj.room},function(err,users){
            if(err) console.log("error");
            //console.log("list user ",users);
            users.forEach(user =>{
                //console.log("name ",user);
                socket.emit("server-send-message", message);
            });        
        });*/
        //var room = messObj.room.toString();
        //socket.to(room).emit("server-send-message",message);
        io.sockets.emit("server-send-message", { message: message, room: messObj.room, roomName: messObj.roomName });
        //io.sockets.in(messObj.room).emit("server-send-message", { message: message, room: messObj.room, roomName: messObj.roomName });
    });

});

const port = 3000;



server.listen(port, function () {
    console.log('Server listening on port: ' + port);
});