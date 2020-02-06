const express = require('express');
const app = express();
const path = require('path');
var server = require('http').Server(app);
const io = require('socket.io')(server);
var users = []


app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log("Connected");

    socket.emit('message-from-server', {
        greeting : 'Hello from server'
    });
    
    socket.on('message-from-client', (msg)=>{
        console.log(msg)
    });

    socket.on('join', data => {
        console.dir(data);
        console.dir(users);
        socket.username = data.username;
        users[socket.username] = socket;
        var userObject = {
            username : data.username,
            socketId : socket.id
        }
        users.push(userObject);
        io.emit('all-users', users);
    });

    socket.on('send-message', data => {
        console.log("Received " + JSON.stringify(data));
        socket.broadcast.emit('message-received', data);
    })
    
    socket.on('send-like', data => {
        console.dir(data);
        socket.broadcast.to(data.like).emit('liked', data);
    });

    socket.on('disconnect', ()=> {
        users = users.filter(item => {
            return item.username !== socket.username
        });
        io.emit('all-users', users);
    })

});



server.listen(8080, ()=> {
    console.log("Server started on port 8080");
})