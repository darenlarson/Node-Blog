const express = require('express');
const userDb = require('../data/helpers/userDb.js');
const tagDb = require('../data/helpers/tagDb.js');
const postDb = require('../data/helpers/postDb.js');

const server = express();

// middleware
server.use(express.json());

function toUpper(req, res, next) {
    const userInfo = req.body;

    req.upperUserInfo = { ...userInfo, name: userInfo.name.toUpperCase() }

    next();
}

// routes
server.get('/users', (req, res) => {
    userDb.get()
        .then(users => {
            res.status(200).json(users);
        })
});

server.get('/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.get(id)
        .then(user => {
            res.status(200).json(user);
        })
});

server.post('/users', toUpper, (req, res) => {

    userDb.insert(req.upperUserInfo)
        .then(idObject => {
            res.status(201).json(idObject);
        })

});

module.exports = server;