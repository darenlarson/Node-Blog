const express = require('express');
const server = express();


// middleware
server.get('/', (req, res) => {
    res.send('server alive');
});

// routes

module.exports = server;