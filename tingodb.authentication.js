const Authentication = require('./authentication');
const fs = require('fs');
const path = require('path');
const Db = require('tingodb')().Db;

class TingoDBAuthentication extends Authentication {
  init(collectionName = 'users') {
    this.collectionName = collectionName;

    let db = new Db('./collections', {});

    // Fetch a collection to insert document into
    this.db = {
      users: db.collection(this.collectionName)
    };

    this.db.users.ensureIndex({ fieldName: 'email', unique: true });
  }

  destroy() {
    fs.unlinkSync(path.join('./collections', this.collectionName));
  }
}

module.exports = TingoDBAuthentication;
