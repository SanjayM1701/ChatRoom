const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formateMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
const port = 80 || process.env.port;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Admin';

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formateMessage(botName, 'Welcome to Chat Web-app!'));

        socket.broadcast.to(user.room).emit('message', formateMessage(botName, `${user.username} has joined the chat`));

            io.to(user.room).emit('roomUsers', {
                room : user.room,
                users: getRoomUsers(user.room)
            });
    });


    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formateMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formateMessage(botName, `${user.username} has left the chat`));
        };

        io.to(user.room).emit('roomUsers', {
            room : user.room,
            users: getRoomUsers(user.room),
        });
    });
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});