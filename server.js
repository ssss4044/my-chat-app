const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// HTMLなどの静的ファイルを「public」フォルダから読み込む設定
app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('誰かがチャットに参加しました');

    // メッセージを受け取った時の処理
    socket.on('chat message', (data) => {
        // 全員（自分含む）にメッセージと名前、送信者のIDを送り出す
        io.emit('chat message', {
            name: data.name,
            text: data.text,
            id: socket.id // 送信者の識別ID
        });
    });

    socket.on('disconnect', () => {
        console.log('誰かが退出しました');
    });
});

// ポート番号の設定（環境変数PORTがあればそれを使い、なければ3000を使う）
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`サーバーが起動しました。ポート: ${PORT}`);
});