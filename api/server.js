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
        .catch(err => {
            res.status(500).json({ error: "The user information could not be retrieved." });
        });
});

server.get('/users/:id', (req, res) => {
    const id = req.params.id;
    userDb.get(id)
        .then(user => {
            if(user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: "The user with the specified ID does not exist" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The user information could not be retrieved." })
        })

});

server.post('/users', toUpper, (req, res) => {

    userDb.insert(req.upperUserInfo)
        .then(idObject => {
            userDb.get(idObject.id)
                .then(user => {
                    res.status(201).json(user);
                })
                .catch(err => {
                    res.status(201).json({ message: "The user has been added"})
                })
        })
        .catch(err => {
            res.status(400).json({ error: "User not added. Please ensure you provide a username"})
        })

});

server.put('/users/:id', toUpper, (req, res) => {

    const id = req.params.id;
    const changes = req.upperUserInfo;

    userDb.update(id, changes)
        .then(count => {
            userDb.get(id)
                .then(user => {
                    res.status(200).json(user);
                })
                .catch(err => {
                    res.status(200).json({ message: "The user info has been updated."})
                })
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be modified." });
        })

})

server.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    let deletedUser = '';

    userDb.get(id)
        .then(user => {
            deletedUser = user.name
            userDb.remove(id)
                .then(count => {
                    res.status(200).json({ message: `${deletedUser} has been removed.` });
                })
                .catch(err => {
                    res.status(404).json({ message: "The user could not be removed." });
                });
        })
        .catch(err => {
            res.status(404).json({ message: "The user with the specified ID does not exist." });
        });

});


module.exports = server;