const express = require('express');
const Authentication = require('./tingodb.authentication');

const app = express();
app.use(express.json());

const authentication = new Authentication();
authentication.init();
const port = 80;

app.post('/api/login', (req, res) => {
  authentication.login(req.body.email, req.body.password).then(
    result => {
      res.send(result);
    },
    error => res.sendStatus(401)
  );
});

app.post('/api/signIn', (req, res) => {
  authentication.signup(req.body.email, req.body.password).then(
    result => {
      res.send(result);
    },
    error => res.sendStatus(500)
  );
});

app.get('/requiresAuth', Authentication.isAuthenticated, (req, res) =>
  res.send(`You're Authenticated!`)
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
