const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Datastore = require('nedb');

// This loads all of the KEY=VALUE strings from the variables.env file and makes them
// available for use here via process.env.KEY.
require('dotenv').config({ path: 'variables.env' });

let db = {
  users: new Datastore({ filename: 'users.db', autoload: true })
};

// Note: Adding, finding, etc. all use callbacks, that's because they are asynchronous.
// I've wrapped all of those with ES6 Promises to translate to something a little more
// common.
class UserStorage {
  // You can only update your own profile.
  updateProfile(profile, Authorization) {
    // return new Promise((resolve, reject) => {
    //   db.insert(user, function(err, newUser) {
    //     if (err) {
    //       reject(err);
    //     } else {
    //       resolve(newUser);
    //     }
    //   });
    // });
  }

  // You don't have to be authorized to see a particular user's profile.
  getProfile(id, Authorization) {
    let query = { _id: id };

    // If I ask for the special ID of "me" then I'm looking at my own profile so I should
    // see all the data on it, including stuff which other users cannot see.
    if (id === 'me') {
      const { _id, email } = UserStorage.getUserId(Authorization);
      query._id = _id;
    }

    return new Promise((resolve, reject) => {
      db.find(query, (err, users) => {
        if (err) {
          reject(err);
        } else {
          let user = users[0];

          if (id === 'me') {
            resolve(user);
          } else {
            resolve(UserStorage.filterUser(users[0]));
          }
        }
      });
    });
  }

  static async signup(email, password, profile = {}) {
    const cryptedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.users.insert(
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

  // You can only remove yourself.
  static leave(Authorization) {
    let { _id, email } = getUserId(Authorization);

    return new Promise((resolve, reject) => {
      db.users.remove({ _id }, {}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  static async login(email, password) {
    return new Promise((resolve, reject) => {
      db.users.find({ email }, async (err, users) => {
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

  // This is a white-list kind of filter. Only the specfic things we want to allow
  // through are going to make it through the filter. Anything not listed will automatically
  // be excluded.
  static filterUser(user) {
    // Note: Neither ID nor email make the cut for this filter, only the creation date
    // for the account. If you want to let some profile data through, you have to do
    // so below.
    return {
      created: user.created,
      profile: {}
    };
  }

  // Looks for a JWT on a given request. If it's there, it verifies that it's valid and
  // extracts the ID and email from it.
  static getUserId(Authorization) {
    Au;
    if (Authorization) {
      const token = Authorization.replace('Bearer ', '');
      const { _id, email } = jwt.verify(token, process.env.JWTSECRET);

      return { _id, email };
    }

    // There was no authorization or the JSON Web Token would not verify.
    throw new Error('Not authenticated');
  }
}

module.exports = UserStorage;
