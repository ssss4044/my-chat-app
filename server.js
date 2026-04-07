const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { maxHttpBufferSize: 2e7 });
const mongoose = require('mongoose');

// --- 1. データベース接続 (MongoDB) ---
const MONGODB_URI = process.env.MONGODB_URI || "あなたの接続文字列";
mongoose.connect(MONGODB_URI).then(() => console.log("DB接続成功"));

// メッセージの保存形式（スキーマ）の定義
const ChatSchema = new mongoose.Schema({
    room: String,
    name: String,
    text: String,
    avatar: String,
    image: String,
    read: { type: Boolean, default: false }, // 既読フラグ
    time: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', ChatSchema);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    // --- 2. ルーム機能 ---
    socket.on('join room', async (roomName) => {
        socket.join(roomName);
        console.log(`ユーザーが部屋 [${roomName}] に参加`);

        // その部屋の過去ログをDBから取得して送る
        const logs = await Chat.find({ room: roomName }).sort({ time: 1 }).limit(100);
        socket.emit('load log', logs);
    });

    socket.on('chat message', async (data) => {
        data.id = socket.id;
        // DBに保存（これでサーバーが消えても残る）
        const newMsg = new Chat({
            room: data.room,
            name: data.name,
            text: data.text,
            avatar: data.avatar,
            image: data.image
        });
        const savedMsg = await newMsg.save();
        
        // 部屋にいる全員に送信
        io.to(data.room).emit('chat message', { ...data, _id: savedMsg._id });
    });

    // --- 3. 既読機能 ---
    socket.on('mark read', async (msgId) => {
        await Chat.findByIdAndUpdate(msgId, { read: true });
        io.emit('update read', msgId);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, "0.0.0.0", () => console.log(`Server: ${PORT}`));