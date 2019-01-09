const express = require('express');
const userDb = require('../data/helpers/userDb.js');
const tagDb = require('../data/helpers/tagDb.js');
const postDb = require('../data/helpers/postDb.js');

const server = express();

// middleware
server.use(express.json());

function toUpper(req, res, next) {
    const splitName = req.body.name.split(' ');
    let nameArr = [];

    for (let i = 0; i < splitName.length; i++) {
        let capName = splitName[i].charAt(0).toUpperCase() + splitName[i].slice(1);

        nameArr.push(capName);
    }
    let formattedName = nameArr.join(' ');

    req.upperUserInfo = { ...req.body, name: formattedName };

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

server.put('/users/:id', toUpper, (req, res) => {

    const id = req.params.id;
    const changes = req.upperUserInfo;

    userDb.update(id, changes)
        .then(count => {
            res.status(200).json(count);
        })

})

server.delete('/users/:id', (req, res) => {
    const id = req.params.id;

    userDb.remove(id)
        .then(count => {
            res.status(200).json(count);
        })
});


module.exports = server;