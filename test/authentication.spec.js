const chai = require('chai');
const fs = require('fs');
const Authentication = require('../authentication');

const expect = chai.expect;
const assert = chai.assert;

const tempUserStorage = 'users.spec.db';

describe('Authentication', () => {
  before(() => {
    this.authentication = new Authentication(tempUserStorage);
  });

  after(() => {
    // Get rid of the database before we start new testing.
    fs.unlinkSync(tempUserStorage);
  });

  it('will fail on a login for a non-existent user + password', async () => {
    // It doesn't matter whether we use async/await or promises to interact with the
    // authentication, it should work either way.
    try {
      let { token, user } = await this.authentication.login(
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
    this.authentication.login('spock@starfleet.com', '').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );

    this.authentication.login('spock@starfleet.com').then(
      result => {
        assert.fail(result);
      },
      () => {}
    );
  });

  it('will allow a user to signup and then immediately login', async () => {
    await this.authentication.signup(
      'leonard.mccoy@starfleet.com',
      'imadoctor'
    );

    let { token, user } = await this.authentication.login(
      'leonard.mccoy@starfleet.com',
      'imadoctor'
    );
    expect(token).not.to.be.undefined;
    expect(user).not.to.be.undefined;
    expect(user._id).not.to.be.undefined;
  });

  it('will fail for a signup and then login with the right user but wrong password or no password', async () => {
    await this.authentication.signup('pavel.chekov@starfleet.com', 'ihatekhan');

    this.authentication
      .login('pavel.chekov@starfleet.com', 'russiansinventedthat')
      .then(
        () => {
          assert.fail('Login with the wrong password should not have worked.');
        },
        () => {}
      );

    this.authentication.login('pavel.chekov@starfleet.com', '').then(
      () => {
        assert.fail('Login with no password should not have worked.');
      },
      () => {}
    );
  });
});
