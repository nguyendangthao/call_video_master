const stream = (socket) => {
    socket.on('subscribe', (data) => {
        //subscribe/join a room
        socket.join(data.room);
        socket.join(data.socketId);

        //Inform other members in the room of new user's arrival
        // if (socket.adapter.rooms[data.room].length > 1) {
        //     socket.to(data.room).emit('new user', { socketId: data.socketId });
        // }
        console.log(socket.rooms);
    });

    socket.on('newUserStart', (data) => {
        socket.to(data.to).emit('newUserStart', { sender: data.sender });
    });

    socket.on('sdp', (data) => {
        socket.to(data.to).emit('sdp', { description: data.description, sender: data.sender });
    });

    socket.on('ice candidates', (data) => {
        socket.to(data.to).emit('ice candidates', { candidate: data.candidate, sender: data.sender });
    });
    socket.on('new user', (data) => {
        // socket.to(data.room).emit('new user', { socketId: data.socketId });
        socket.join(data.roomCall);
        socket.to(data.roomCall).emit('new user', { socketId: data.socketId });
    });
    socket.on('startcall', (data) => {
        socket.join(data.roomCall);
        socket.to(data.room).emit('startcall', { username: data.username });
    });
    socket.on('closetcall', (data) => {
        socket.to(data.room).emit('closetcall', { username: data.username });
    });
    socket.on('outcall', (data) => {
        socket.to(data.roomCall).emit('outcall', { username: data.username });
    });

}

module.exports = stream;