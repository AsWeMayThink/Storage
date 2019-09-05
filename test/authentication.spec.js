const chai = require('chai');
const UserStorage = require('../userStorage');

const expect = chai.expect;
const assert = chai.assert;

describe('Authentication', () => {
  before(() => {
    // Get rid of the database before we start new testing.

    this.userStorage = new UserStorage('users.spec.db');
  });

  it('will fail on a login for a non-existent user + password', () => {
    this.userStorage.login('james.kirk@starfleet.com', 'ihatetribbles').then(
      result => {
        assert.fail(result);
      },
      () => {
        // The promise returned should reject. If it doesn't, it's an error.
      }
    );
  });

  it('will fail on a login for a non-existent user + no password', () => {
    // As with the previous test, it's an error _not_ to throw an exception for either
    // of these.
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

  it('will fail if you attempt to leave without login', () => {
    this.userStorage.leave();
    expect(true).to.equal(false);
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
