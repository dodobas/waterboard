/* global describe, it, before */

import chai from 'chai';

import {trim, rtrim, truncate} from '../src/base.js';

chai.expect();

const expect = chai.expect;

let result;

/*

BASE

 */

describe('Given a String with leading and trailing spaces', () => {
    before(() => {
        result = trim('    knek   ');
    });
    describe('when I trim the string', () => {
        it('should return string with no leading and trailing spaces', () => {
            expect(result).to.be.equal('knek');
        });
    });
});

describe('Given a String with trailing spaces', () => {
    before(() => {
        result = rtrim('knek   ');
    });
    describe('when I rtrim the string', () => {
        it('should return string with no trailing spaces', () => {
            expect(result).to.be.equal('knek');
        });
    });
});

describe('Given a String and end position', () => {
    before(() => {
        result = truncate('knek   ', 4);
    });
    describe('when I truncate the string', () => {
        it('should return string with specified amount of chars', () => {
            expect(result).to.be.equal('knek');
        });
    });
});
