// server/app.js

const express = require('express');
const path = require('path');
const Duo = require('duo_web');
const bodyParser = require('body-parser');
const creds = require('./creds');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  if (!req.query.user) {
    res.send('Please provide a user in the query string, ie "?user=bob"');
    return;
  }

  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});


app.get('/frame_data', (req, res) => {
  const user = req.query.user;

  // generate the signed request with the client's username
  const sigRequest = Duo.sign_request(creds.ikey, creds.skey, creds.akey, user);
  res.json({sigRequest, host: creds.host});
});


app.post('/post_action', (req, res) => {
  // verify the signed response passed from the client
  var signedResponse = req.body.signedResponse;
  var authenticatedUsername = Duo.verify_response(
    creds.ikey, creds.skey, creds.akey, signedResponse);

  if (authenticatedUsername) {
    res.json({})
  } else {
    res.status(401);
    res.json({});
  }
});

app.use(express.static(path.resolve(__dirname, '..', 'build')));

module.exports = app; 