/* global describe, it, before */

import chai from 'chai';

import base from '../src/base.js';

chai.expect();

const expect = chai.expect;

let result;

/*

BASE

 */

describe('Given a String as argument', () => {
    before(() => {
        result = base.sampleTest('should_return_this_text');
    });
    describe('when I execute the function', () => {
        it('should return same string', () => {
            expect(result).to.be.equal('should_return_this_text');
        });
    });
});
