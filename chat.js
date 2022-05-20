var mysql = require('mysql');
const time = require('./call.js');

require('dotenv').config();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

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
        
        // Send the client message to all clients
        io.emit('chat-message', message);
        
        // Store the message in the database
        sql = "INSERT INTO chat (username, message, track) VALUES ?"
        var values = [[message.name, message.message, message.track]]

        con.query(sql, [values], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
    })
});