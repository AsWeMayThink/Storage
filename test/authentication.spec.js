const chai = require('chai');

const expect = chai.expect;

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      expect([1, 2, 3].indexOf(4)).to.equal(-1);
    });
  });
});

describe('Authentication', () => {
  it('will fail on a login for a non-existent user + password', () => {
    expect(true).to.equal(false);
  });

  it('will fail for a non-existent user + no password', () => {
    expect(true).to.equal(false);
  });

  it('will allow a user to signup and then immediately login', () => {
    expect(true).to.equal(false);
  });

  it('will allow a user to signup, login, and logout', () => {
    expect(true).to.equal(false);
  });

  it('will fail for the sequence: signup, login, leave, login', () => {
    expect(true).to.equal(false);
  });

  it('will fail if you attempt to leave without login', () => {
    expect(true).to.equal(false);
  });

  it('will fail for a signup and then login with the right user but wrong password', () => {
    expect(true).to.equal(false);
  });

  it('will fail for a signup and login with the right user but no password', () => {
    expect(true).to.equal(false);
  });
});
