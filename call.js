const axios = require('axios');
const moment = require('moment');
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
        "time" : await format_time(item.playedat)
      }
      tracks.push(track);
    });
    return tracks;
}

// Convert unix time to (hh:mm) format and Greek timezone
async function format_time(s) {
  return moment.unix(s).utcOffset('+0200').format('HH:mm');
}

// The function that makes the call to the shoutcast server with axios
async function callInfo() {
    return await axios(url)
    .then( async response => {
    return await handleResponse(response);
    }).catch(err => {  });
}

// Export the response
module.exports = {callInfo};