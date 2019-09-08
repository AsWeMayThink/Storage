const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// This loads all of the KEY=VALUE strings from the variables.env file and makes them
// available for use here via process.env.KEY.
require('dotenv').config({ path: 'variables.env' });

// Note: Adding, finding, etc. all use callbacks, that's because they are asynchronous.
// I've wrapped all of those with ES6 Promises to translate to something a little more
// common.
class Authentication {
  signup(email, password, profile = {}) {
    return bcrypt.hash(password, 10).then(cryptedPassword => {
      return new Promise((resolve, reject) => {
        this.db.users.insert(
          {
            email,
            password: cryptedPassword,
            created: new Date(),
            profile: profile
          },
          (err, newUser) => {
            if (err) {
              reject(err);
            } else {
              const token = jwt.sign(
                { _id: newUser._id, email: newUser.email },
                process.env.JWTSECRET
              );

              resolve({
                token,
                user: newUser
              });
            }
          }
        );
      });
    });
  }

  login(email, password) {
    return new Promise((resolve, reject) => {
      this.db.users.findOne({ email }, (err, user) => {
        if (err || !user) {
          reject('User/password failed.');
        } else {
          bcrypt.compare(password, user.password).then(valid => {
            if (!valid) {
              reject(new Error('Invalid password.'));
            }

            const token = jwt.sign(
              { _id: user._id, email: user.email },
              process.env.JWTSECRET
            );

            resolve({
              token,
              user
            });
          });
        }
      });
    });
  }

  // Looks for a JWT on a given request. If it's there, it verifies that it's valid and
  // extracts the ID and email from it.
  static isAuthenticated(req, res, next) {
    const Authorization = req.get('Authorization');

    if (Authorization) {
      const token = Authorization.replace('Bearer ', '');
      const payload = jwt.verify(token, process.env.JWTSECRET);

      // Attach the signed payload of the token (decrypted of course) to the request.
      req.jwt = {
        payload
      };

      next();
    }

    // There was no authorization or the JSON Web Token would not verify.
    res.sendStatus(401);
  }
}

module.exports = Authentication;
