const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  user.password = bcrypt.hashSync(user.password, 14)

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;
  

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
      console.log("error", error)
    });
});
// protect this end point
// authorization - token , or username/password in headers will grant authorization
server.get('/api/users', (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

function restricted(req, res, next) {
  const { username, password } = req.headers // THIS IS NOT NORMAL
  if (username && password) {
    Users.findBy({username})
    .first()
    .then(user => {
      if(user && bcrypt.compareSync(password, user.password)) {
        next()
      } else {
        res.status(401).json({message: "invalid"})
      }
    }) 
  } else {
    res.status(400).json({message: "please provide username and passowrd"})
  }
}


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
