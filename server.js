const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// HTMLなどの静的ファイルを「public」フォルダから読み込む設定
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('ユーザーが接続しました');

    // メッセージを受け取った時の処理
    socket.on('chat message', (data) => {
        // 全員（自分含む）にメッセージ、名前、送信者のIDを送り出す
        io.emit('chat message', {
            name: data.name,
            text: data.text,
            id: socket.id // 送信者の識別ID
        });
    });

    socket.on('disconnect', () => {
        console.log('ユーザーが切断しました');
    });
});

// Renderなどの環境では process.env.PORT が自動で割り当てられます
const PORT = process.env.PORT || 3000;

// "0.0.0.0" を指定することで、外部（インターネット）からのアクセスを許可します
http.listen(PORT, "0.0.0.0", () => {
    console.log(`サーバーが起動しました。ポート: ${PORT}`);
});