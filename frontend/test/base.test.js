/* global describe, it, before */

import chai from 'chai';

chai.expect();

const expect = chai.expect;

let result;

/*

Sample Test

 */
function sampleTest (arg) {
    return arg;
}

describe('Given a String as argument', () => {
    before(() => {
        result = sampleTest('should_return_this_text');
    });
    describe('when I execute the function', () => {
        it('should return same string', () => {
            expect(result).to.be.equal('should_return_this_text');
        });
    });
});
