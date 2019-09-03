const Datastore = require('nedb');

let db = new Datastore({ filename: 'users.db', autoload: true });

// Note: Adding, finding, etc. all use callbacks, that's because they are asynchronous.
// I've wrapped all of those with ES6 Promises to translate to something a little more
// common.
class UserStorage {
  constructor(myId) {
    this.myId = myId;
  }

  addUser(user) {
    // We don't want to attempt to set the ID on the new record. It shouldn't have one
    // and we'll use to delete to make sure.
    delete user._id;

    return new Promise((resolve, reject) => {
      db.insert(user, function(err, newUser) {
        if (err) {
          reject(err);
        } else {
          resolve(newUser);
        }
      });
    });
  }

  getUser(id) {
    let query = { _id: id };

    // If I ask for the special ID of "me" then I'm looking at my own profile so I should
    // see all the data on it, including stuff which other users cannot see.
    if (id === 'me') {
      query._id = this.myId;
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

  // This is a white-list kind of filter. Only the specfic things we want to allow
  // through are going to make it through the filter. Anything not listed will automatically
  // be excluded.
  static filterUser(user) {
    return {
      name: user.name,
      created: user.created,
      about: user.about
    };
  }
}

let userStorage = new UserStorage('V4sJMN4pOkbtydVe');

// userStorage.addUser({
//   name: 'JohnMunsch',
//   created: new Date(2012, 5, 20),
//   about: '',
//   email: 'john.munsch@gmail.com'
// }).then(newUser => console.log(newUser));

// This version is me looking at myself. I should see my email on the profile.
userStorage.getUser('me').then(user => console.log(user));

// This is me looking at another user or looking at myself as another user would see me.
// I should not see an email here.
userStorage.getUser('V4sJMN4pOkbtydVe').then(user => console.log(user));
