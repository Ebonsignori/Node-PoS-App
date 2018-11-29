const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised).should();

describe('Chars in string', function () {
    it('should return number of characters in a string', function () {
        "Hello".length.should.equal(5);
    });
    it('should return first character of the string', function () {
        "Hello".charAt(0).should.equal('H');
    });
});