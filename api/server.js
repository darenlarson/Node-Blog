const express = require('express');
const userDb = require('../data/helpers/userDb.js');
const tagDb = require('../data/helpers/tagDb.js');
const postDb = require('../data/helpers/postDb.js');

const server = express();

// middleware
server.use(express.json());

// When this middleware function is used in routes, it ensures only the 1st letter of each name is capitalized, and the rest are lowercase.
function toUpper(req, res, next) {
    const splitName = req.body.name.toLowerCase().split(' ');
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
// user routes
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

    userDb.insert(req.upperUserInfo) // req.upperUserInfo comes from the toUpper middleware. It is the formated version of the provided user name.
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
            res.status(500).json({ error: "The user information could not be modified." });
        })

})


server.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    let deletedUser = '';

    // First getting the infomration of the user that's being deleted so that we can then send it back in the response after it is deleted from the databasse
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

// post routes
server.get('/posts', (req, res) => {

    postDb.get()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be retrieved." });
        });

});


server.get('/posts/:id', (req, res) => {

    const id = req.params.id;
    
    postDb.get(id)
        .then(post => {
            if(post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            }
        })
        .catch(err => {
            console.log(id);
            res.status(500).json({ error: "The post information could not be retrieved." })
        })

});


server.post('/posts', (req, res) => {
    let postInfo = req.body;

    postDb.insert(req.body)
        .then(idObject => {
            postDb.get(idObject.id)
                .then(post => {
                    res.status(201).json({ message: `The following post was successfully submitted by ${post.postedBy}: ${post.text}` });
                })
                .catch(err => {
                    res.status(201).json({ message: "The post was successful" });
                });
        })
        .catch(err => {
            res.status(400).json({ error: "Post not added. Please ensure you provided a user Id and valid post text"})
        })

});


server.put('/posts/:id', (req, res) => {

    const id = req.params.id;
    const changes = req.body

    postDb.update(id, changes)
        .then(count => {
            postDb.get(id)
                .then(post => {
                    res.status(200).json(post);
                })
                .catch(err => {
                    res.status(200).json({ message: "The post has been updated."})
                })
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be modified." });
        })

});


server.delete('/posts/:id', (req, res) => {
    const id = req.params.id;

    // First getting the information of the post that's being deleted so that we can then send it back in the response after it is deleted from the databasse
    postDb.get(id)
        .then(post => {
            let deletedPost = post.text;

            postDb.remove(id)
                .then(count => {
                    res.status(200).json({ message: `The following post has been removed: ${deletedPost}` });
                })
                .catch(err => {
                    res.status(404).json({ message: "The post could not be removed." });
                });
        })
        .catch(err => {
            res.status(404).json({ message: "The post with the specified ID does not exist." });
        });

});


// exports the this server to index.js
module.exports = server;