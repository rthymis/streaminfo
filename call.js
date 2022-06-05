const axios = require('axios');
const moment = require('moment-timezone');
require('dotenv').config();

// The url of the json file at the shoutcast server taken from the local variables
const url = process.env.URL;

/* 
The function that handles the response from the shoutcast server
Returns an array of 10 objects (tracks)
Each object contains the artist, the title and the start-time of the track
*/
async function handleResponse(resp) {
    tracks = [];
    resp.data.forEach( async (item) => {
      let track = {
        "artist" : item.metadata.tpe1,
        "title" : item.metadata.tit2,
        "time" : await formatTime(item.playedat, 'HH:mm:ss')
      }
      tracks.push(track);
    });
    // Set the tracks object to a global variable for use by the chat
    global.tracks = tracks;
    return tracks;
}

// Convert unix time to (hh:mm) format and Greek timezone
async function formatTime(time, format) {
  return moment.unix(time).tz('Europe/Athens').format(format);
}

// Returns the current time (now)
function timeNow() {
  return moment().format("DD MMM YY, HH:mm");
}

function timeChat(time) {
  return moment(time).format("DD MMM YY, HH:mm");
}

// The function that makes the call to the shoutcast server with axios
async function callInfo() {
    return await axios(url)
    .then( async response => {
    return await handleResponse(response);
    }).catch(err => { "Axios error" });
}

// Export the response
module.exports = {callInfo, timeNow, timeChat};