const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    maxHttpBufferSize: 2e7 
});

let chatLog = [];
const MAX_LOG = 100;

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    socket.emit('load log', chatLog);

    socket.on('chat message', (data) => {
        data.id = socket.id;
        chatLog.push(data);
        if (chatLog.length > MAX_LOG) chatLog.shift();
        io.emit('chat message', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () => {
    console.log(`サーバー起動中: ${PORT}`);
});