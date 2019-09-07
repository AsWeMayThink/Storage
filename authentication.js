const bcrypt = require('bcryptjs');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb');

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
  static getUserId(Authorization) {
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '');
      const { _id, email } = jwt.verify(token, process.env.JWTSECRET);

      return { _id, email };
    }

    // There was no authorization or the JSON Web Token would not verify.
    throw new Error('Not authenticated');
  }
}

class NeDBAuthentication extends Authentication {
  init(filename = 'users.db') {
    this.filename = filename;

    this.db = {
      users: new Datastore({ filename, autoload: true })
    };
  }

  destroy() {
    fs.unlinkSync(this.filename);
  }
}

const MongoClient = require('mongodb').MongoClient;

class MongoDBAuthentication extends Authentication {
  constructor() {
    super();
  }

  async init() {
    const uri = process.env.MONGODB_URI;

    this.client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await this.client.connect();

    this.db = {
      users: this.client.db('test').collection('users')
    };
  }

  destroy() {
    this.client.close();
  }
}

module.exports = MongoDBAuthentication;
