const express = require('express');
const Authentication = require('./nedb.authentication');

const app = express();
app.use(express.json());

const authentication = new Authentication();
authentication.init();
const port = 80;

// Assuming this in the POSTed body.
// { email: 'john.munsch@gmail.com', password: 'password' }
app.post('/api/login', (req, res) => {
  authentication.login(req.body.email, req.body.password).then(
    result => {
      res.send(result);
    },
    error => {
      res.sendStatus(401);
    }
  );
});

// The signup process is effectively signup and login.
app.post('/api/signup', (req, res) => {
  authentication.signup(req.body.email, req.body.password).then(
    result => {
      res.send(result);
    },
    error => {
      res.status(500).send(error);
    }
  );
});

app.get('/api/requiresAuth', Authentication.isAuthenticated, (req, res) => {
  res.json({
    superSecretData: 'rosebud',
    jwt: req.jwt
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
