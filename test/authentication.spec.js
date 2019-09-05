const chai = require('chai');
const UserStorage = require('../userStorage');

const expect = chai.expect;
const assert = chai.assert;

describe('Authentication', () => {
  it('will fail on a login for a non-existent user + password', () => {
    UserStorage.login('james.kirk@starfleet.com', 'ihatetribbles').then(
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
    UserStorage.login('spock@starfleet.com', '').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );

    UserStorage.login('spock@starfleet.com').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );
  });

  it('will allow a user to signup and then immediately login', () => {
    UserStorage.signup('leonard.mccoy@starfleet.com', 'imadoctor').then(
      () => {},
      () => {
        assert.fail('Signup should not have failed.');
      }
    );
    UserStorage.login('leonard.mccoy@starfleet.com', 'imadoctor').then(
      () => {},
      () => {
        assert.fail('Login should not have failed.');
      }
    );
  });

  it('will fail for the sequence: signup, login, leave, login', () => {
    UserStorage.signup('hikaru.sulu@starfleet.com', 'idratherbefencing');
    UserStorage.login('hikaru.sulu@starfleet.com', 'idratherbefencing');
    UserStorage.leave();
    UserStorage.login('hikaru.sulu@starfleet.com', 'idratherbefencing');
    expect(true).to.equal(false);
  });

  it('will fail if you attempt to leave without login', () => {
    UserStorage.leave();
    expect(true).to.equal(false);
  });

  it('will fail for a signup and then login with the right user but wrong password or no password', () => {
    UserStorage.signup('pavel.chekov@starfleet.com', 'ihatekhan').then(
      () => {},
      () => {
        assert.fail('Signup should not have failed.');
      }
    );

    UserStorage.login(
      'pavel.chekov@starfleet.com',
      'russiansinventedthat'
    ).then(
      () => {
        assert.fail('Login with the wrong password should not have worked.');
      },
      () => {}
    );

    UserStorage.login('pavel.chekov@starfleet.com', '').then(
      () => {
        assert.fail('Login with no password should not have worked.');
      },
      () => {}
    );
  });
});
