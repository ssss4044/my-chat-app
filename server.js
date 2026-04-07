const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    maxHttpBufferSize: 2e7 // 画像送信のため20MBまで許可
});

// --- 履歴保存用の配列 ---
let chatLog = [];
const MAX_LOG = 100; // 保存する最大件数

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('ユーザーが接続しました');

    // 【新規】接続した人にだけ、これまでの履歴を全送信する
    socket.emit('load log', chatLog);

    socket.on('chat message', (data) => {
        // 送信者の識別IDを付加
        data.id = socket.id;

        // 履歴に追加
        chatLog.push(data);
        if (chatLog.length > MAX_LOG) {
            chatLog.shift(); // 100件を超えたら古い順に削除
        }

        // 全員にリアルタイム送信
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('ユーザーが退出しました');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () => {
    console.log(`サーバー起動中: ポート${PORT}`);
});