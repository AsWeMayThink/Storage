const chai = require('chai');
const fs = require('fs');
const UserStorage = require('../userStorage');

const expect = chai.expect;
const assert = chai.assert;

describe('Authentication', () => {
  before(() => {
    const tempUserStorage = 'users.spec.db';

    // Get rid of the database before we start new testing.
    fs.unlinkSync(tempUserStorage);
    this.userStorage = new UserStorage(tempUserStorage);
  });

  it('will fail on a login for a non-existent user + password', async () => {
    // It doesn't matter whether we use async/await or promises to interact with the
    // authentication, it should work either way.
    try {
      let { token, user } = await this.userStorage.login(
        'james.kirk@starfleet.com',
        'ihatetribbles'
      );
      assert.fail(result);
    } catch (error) {
      // The promise returned should reject. If it doesn't, it's an error.
    }
  });

  it('will fail on a login for a non-existent user + no password', () => {
    // As with the previous test, it's an error _not_ to throw an exception for either
    // of these. Note: This test uses .then() with success and failure functions.
    this.userStorage.login('spock@starfleet.com', '').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );

    this.userStorage.login('spock@starfleet.com').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );
  });

  it('will allow a user to signup and then immediately login', () => {
    this.userStorage.signup('leonard.mccoy@starfleet.com', 'imadoctor').then(
      () => {},
      () => {
        assert.fail('Signup should not have failed.');
      }
    );
    this.userStorage.login('leonard.mccoy@starfleet.com', 'imadoctor').then(
      result => {
        expect(result.token).to.exist();
        expect(result.user).to.exist();
        expect(result.user._id).to.exist();
      },
      () => {
        assert.fail('Login should not have failed.');
      }
    );
  });

  it('will fail for the sequence: signup, login, leave, login', () => {
    this.userStorage.signup('hikaru.sulu@starfleet.com', 'idratherbefencing');
    this.userStorage
      .login('hikaru.sulu@starfleet.com', 'idratherbefencing')
      .then(result => {});
    this.userStorage.leave();
    this.userStorage.login('hikaru.sulu@starfleet.com', 'idratherbefencing');
    expect(true).to.equal(false);
  });

  it('will fail if you attempt to leave without login', async () => {
    let { token, user } = await this.userStorage.signup(
      'nyota.uhura@starfleet.com',
      'surecontactstarfleetagain'
    );
    this.userStorage.leave(user._id).then();
  });

  it('will fail for a signup and then login with the right user but wrong password or no password', () => {
    this.userStorage.signup('pavel.chekov@starfleet.com', 'ihatekhan').then(
      () => {},
      () => {
        assert.fail('Signup should not have failed.');
      }
    );

    this.userStorage
      .login('pavel.chekov@starfleet.com', 'russiansinventedthat')
      .then(
        () => {
          assert.fail('Login with the wrong password should not have worked.');
        },
        () => {}
      );

    this.userStorage.login('pavel.chekov@starfleet.com', '').then(
      () => {
        assert.fail('Login with no password should not have worked.');
      },
      () => {}
    );
  });
});
