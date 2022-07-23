require('dotenv').config();
const PORT = process.env.PORT;

const http = require('http');
const axios = require('axios');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: '*',
    }
});

// Actions that happen when a new listener connects
io.on("connection", async (socket) => {
    // Call the function that sends the stream info to the new listener
    await sendToNew(socket);
    // Send the stream info to an existing listener
    socket.on('streaminforequest', async () => {
        var response = await getResponse();
        if (await response) {
            socket.emit('streaminfoinitial', await response );
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const tracks = require('./call.js');

// Initialize the object that will hold the current track start time
var check = "";

// The function that calls the call function
async function getResponse() {
    return await tracks.callInfo();
}

// The function that sends the stream info to all listeners
async function sendToAll() {
  var response = await getResponse();
  if (await response && response[0].time !== check) {
    check = response[0].time;
    // io.emit('streaminfo', await response[0].title);
    io.emit('streaminfo', await response );
  } 
}

// The function that sends the stream info to a new listener
async function sendToNew(socket) {
    var response = await getResponse();
    if (await response) {
        // socket.emit('streaminfo', (await response[0].title) + '(initial)')
        socket.emit('streaminfoinitial', await response)
    } else {
        socket.emit('streaminfoinitial', 'Error loading the stream info.' )
    }   
}

// The function that sets the interval
function setTheInterval() {
  var interval = setInterval(sendToAll, 3000);
}

// Call the interval function on initialize
setTheInterval();

// Set the io variable in a global variable for use by the chat
global.io = io;

// Require the chat module
const chat = require('./chat.js');






