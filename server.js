const express = require('express');
const app = express();
const http = require('http').createServer(app);
// 画像などの大きいデータを送れるように制限を20MBに緩和
const io = require('socket.io')(http, {
    maxHttpBufferSize: 2e7 
});

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    socket.on('chat message', (data) => {
        // 送信者のIDを付与して全員に転送
        data.id = socket.id;
        io.emit('chat message', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () => {
    console.log(`サーバー起動中: ${PORT}`);
});