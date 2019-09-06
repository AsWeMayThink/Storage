const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb');

// This loads all of the KEY=VALUE strings from the variables.env file and makes them
// available for use here via process.env.KEY.
require('dotenv').config({ path: 'variables.env' });

// Note: Adding, finding, etc. all use callbacks, that's because they are asynchronous.
// I've wrapped all of those with ES6 Promises to translate to something a little more
// common.
class Authentication {
  constructor(filename = 'users.db') {
    this.db = {
      users: new Datastore({ filename, autoload: true })
    };
  }

  async signup(email, password, profile = {}) {
    const cryptedPassword = await bcrypt.hash(password, 10);

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
  }

  async login(email, password) {
    return new Promise((resolve, reject) => {
      this.db.users.find({ email }, async (err, users) => {
        if (err) {
          reject(err);
        } else if (users.length === 0) {
          reject('User/password failed.');
        } else {
          let user = users[0];

          const valid = await bcrypt.compare(password, user.password);

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

const MongoClient = require('mongodb').MongoClient;

class MongoDBAuthentication extends Authentication {
  constructor() {
    super();

    const uri = process.env.MONGODB_URI;

    const client = new MongoClient(uri, { useNewUrlParser: true });

    client.connect(err => {
      this.db = {
        users: client.db('test').collection('users')
      };

      // client.close();
    });
  }
}
module.exports = MongoDBAuthentication;
