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

io.on("connection", async (socket) => {
    // Call the function that sends the stream info to the new listener
    await sendToNew(socket);
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const tracks = require('./call.js');

// // initialize the object that will hold the current track
// var theCheck = {
//   "artist": "",
//   "title": "",
// //   "time": ""
// };

// Temporary Check
var theCheck = "";

// Function that calls the call function
async function getResponse() {
    return await tracks.callInfo();
}

// The function that sends the stream info to all listeners
async function sendToAll(){
  var response = await getResponse();
  if (await response && response !== theCheck) {
    theCheck = response;
    io.emit('streaminfo', await response);
  } 
}

// The function that sends the stream info to a new listener
async function sendToNew(socket) {
    var response = await getResponse();
    if (await response) {
        socket.emit('streaminfo', (await response) + ' (initial)' )
    } else {
        socket.emit('streaminfo', 'Error loading the stream info. Please hit Refresh.' )
    }   
}

// Function that sets the interval
function setTheInterval() {
  var interval = setInterval(sendToAll, 2000);
}

// Call the interval function on initialize
setTheInterval();






