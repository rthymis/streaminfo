var mysql = require('mysql');
const time = require('./call.js');
const crypto = require('crypto');

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
    database: "chat-db",
    charset : 'utf8mb4'
});

var allMessages = [];

// Connect to the database
con.connect(function(err) {
    if (err) throw err;
    // Set the character set that supports emojis
    sql = "SET NAMES utf8mb4";
    con.query(sql, function (err, result) {
        if (err) throw err;
    });

    // Get the latest 30 chat messages from the database and put in global variable
    var initialSql = 'SELECT * FROM (SELECT * FROM chat ORDER BY datetime DESC LIMIT 30) as foo ORDER BY datetime ASC';
    con.query(initialSql, function (err, result) {
        if (err) throw err;
        Object.keys(result).forEach(function(key) {
            var row = result[key];
            row.datetime = time.timeChat(row.datetime)
            let message = {
                "index": row.index,
                "id": row.id,
                "username": row.username,
                "message": row.message,
                "track": row.track,
                "datetime": row.datetime
            }
            allMessages.push(message);
          });
          console.log(allMessages);
    });

    console.log("Database connected!");  
});

io.on("connection", socket => {
    socket.on('send-chat-message',async message => {
        // Add the current track to the message
        message.track = global.tracks[0].artist + " - " + global.tracks[0].title;
        // Add the current time to the message
        message.time = time.timeNow();
        // Add the unique ID to the message
        message.id = crypto.randomUUID();

        if (message.name !== CHAT_ADMIN) {
            // Send the client message to all clients
            io.emit('chat-message', message);
        } else if (message.password && message.password == CHAT_PASSWORD) {
            delete message.password;
            io.emit('chat-message', message);
        } else {
            message.error = "Username is already in use.";
            ['id', 'message', 'name', 'track', 'time'].forEach(e => delete message[e]);
            socket.emit('chat-error', message);
        }

        // Store the message in the database
        sql = "INSERT INTO chat (id, username, message, track) VALUES ?"
        var values = [[message.id, message.name, message.message, message.track]]

        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });

        let messageForAllMessages = {
            "index": null,
            "id": message.id,
            "username": message.name,
            "message": message.message,
            "track": message.track,
            "datetime": message.time
        }
        allMessages.push(messageForAllMessages);
    })

    socket.on('chat-delete-client',async messageId => {
        // Delete the message
        sql = "DELETE FROM chat WHERE `id` = ?";
        
        var id = [messageId];
        
        con.query(sql, [id], function (err, result) {
            let message = {
                "message" : 'Message successfully deleted.',
                "messageId" : messageId
              }
            if (err) {
                message.message = 'Could not delete message: ' + err;
            }
            socket.emit('chat-delete-server-admin', message);
            socket.broadcast.emit('chat-delete-server', messageId);
        });
        
    })

    // Send all the chat messages
    socket.on('chat-all-messages-client', () => {
        if (allMessages !== null) {
            socket.emit('chat-all-messages', allMessages)
        }
    })
});