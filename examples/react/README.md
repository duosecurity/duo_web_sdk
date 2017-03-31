# React + Duo Web example

This is an example of a small React+Express application that uses the [Duo Web](https://duo.com/docs/duoweb) client Javascript to
initialize a Duo Authentication Prompt and sends the signed response to the backend for verification.

## Configuration

In `server/creds.js`, modify the object with your Duo integration configuration:

```js
{
    "ikey": "",
    "skey": "",
    "akey": "",
    "host": ""
}
```

## Installation and Running

Install the dependencies, build the client code, and start the server:

```
npm install
npm run build
npm start
```

After that you can browse to `http://localhost:9000/?user=myname`, where `myname` can be substituted for any username.