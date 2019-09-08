const Authentication = require('./authentication');
const fs = require('fs');
const Datastore = require('nedb');

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

module.exports = NeDBAuthentication;
