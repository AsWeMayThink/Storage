const Authentication = require('./authentication');
const MongoClient = require('mongodb').MongoClient;

class MongoDBAuthentication extends Authentication {
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

    this.db.users.ensureIndex('email', { unique: true });
  }

  destroy() {
    this.client.close();
  }
}

module.exports = MongoDBAuthentication;
