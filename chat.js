var mysql = require('mysql');
const time = require('./call.js');

require('dotenv').config();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const CHAT_ADMIN = process.env.CHAT_ADMIN;
const CHAT_PASSWORD = process.env.CHAT_PASSWORD;

// database settings
var con = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: DB_USER,
    password: DB_PASSWORD,
    database: "chat-db"
});

// Connect to the database
con.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");  
});

io.on("connection", socket => {
    socket.on('send-chat-message',async message => {
        // Add the current track to the message
        message.track = global.tracks[0].artist + " - " + global.tracks[0].title;
        // Add the current time to the message
        message.time = time.timeNow();

        if (message.name !== CHAT_ADMIN) {
            // Send the client message to all clients
            io.emit('chat-message', message);
        } else if (message.password && message.password == CHAT_PASSWORD) {
            delete message.password;
            io.emit('chat-message', message);
        } else {
            message.error = "Username is already in use.";
            ['message', 'name', 'track', 'time'].forEach(e => delete message[e]);
            socket.emit('chat-error', message);
        }

        // Store the message in the database
        sql = "INSERT INTO chat (username, message, track) VALUES ?"
        var values = [[message.name, message.message, message.track]]

        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    })

    socket.on('chat-delete-client',async messageId => {
        // Delete the message
        sql = "DELETE FROM chat WHERE `index` = ?";
        
        var index = [parseInt(messageId)];
        
        con.query(sql, [index], function (err, result) {
            let message = {
                "message" : 'Message ' + messageId + ' successfully deleted.',
                "messageId" : messageId
              }
            if (err) {
                message.message = 'Could not delete message ' + messageId + ': ' + err;
            }
            socket.emit('chat-delete-server-admin', message);
            socket.broadcast.emit('chat-delete-server', messageId);
        });
        
    })
});
