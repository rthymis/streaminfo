const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

// The url of the json file at the shoutcast server take nfrom the local variables
const url = process.env.URL;

// The url that we want for the future
// const url = 'http://eu1.reliastream.com:7082/played?sid=1&pass=eW4p0X6my7dj&type=json';
// Test url
// const url = 'http://eu1.reliastream.com:2199/rpc/mondobon/streaminfo.get';
// The wrong url
// const url = 'http://eu1.reliastream.com:2199/rpc/mondobon/streaminscdascfo.getsdaSdssvdvds';

// The function that handles the response from the shoutcast server.
// Returns an array of 10 objects (tracks)
// Each object contains the artist, title and time info.
async function handleResponse(resp) {
//   if (resp.data.data[0].track.artist !== theCheck.artist && resp.data.data[0].track.title !== theCheck.title) {
//     theCheck.artist = resp.data.data[0].track.artist;
//     theCheck.title = resp.data.data[0].track.title;
//     tracks = [];
//     resp.data.forEach( async (item) => {
//       let track = {
//         "artist" : item.data[0].track.artist,
//         "title" : item.data[0].track.title,
//         // "time" : await format_time(item.playedat)
//       }
//       tracks.push(track);
//     });
//     return tracks;
//   }

    return resp.data.data[0].song;  

}

// // Convert unix time to (hh:mm) format
// async function format_time(s) {
//   return moment.unix(s).utcOffset('+0200').format('HH:mm');
// }

// The function that makes the call to the shoutcast server with axios
async function callInfo() {
    return await axios(url)
    .then( async response => {
    return await handleResponse(response);
    }).catch(err => {  });
}

// Export the response
module.exports = {callInfo};