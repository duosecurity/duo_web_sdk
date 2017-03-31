// server/index.js
'use strict';

const app = require('./app');

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log("Visit the root URL with a 'user' argument, e.g:")
  console.log(`'http://localhost:${PORT}/?user=myname'."`)
});