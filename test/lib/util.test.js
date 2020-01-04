require('mocha');
const {expect} = require('chai');
const {_} = require('../../dist/index');
const {isMatch} = require('../../dist/lib/utils');

class Foo { constructor(a, b) { this.a = a; this.b = b; } }
class Bar { constructor(a, b) { this.a = a; this.b = b; } }

describe('utils/isMatch', () => {

  it('should match scalar numbers', () => {
    const result1 = isMatch(5, 5);
    const result2 = isMatch(4, 5);
    expect(result1).to.be.true;
    expect(result2).to.be.false;
  });

  it('should match scalar numbers even if it\'s zero', () => {
    const result = isMatch(0, 0);
    expect(result).to.be.true;
  });

  it('should match scalar value with a function', () => {
    const fnMatch = x => x % 2 == 0;
    const result1 = isMatch(4, fnMatch);
    const result2 = isMatch(5, fnMatch);
    expect(result1).to.be.true;
    expect(result2).to.be.false;
  });

  it('should match regular expressions', () => {
    const result1 = isMatch('foo', /foo/);
    const result2 = isMatch('bar', /foo/);
    expect(result1).to.be.true;
    expect(result2).to.be.false;
  });

  try {
    eval('Symbol');

    it('should match symbols', () => {
      const s1 = Symbol('foo');
      const s2 = Symbol('foo');

      const result1 = isMatch(s1, s1);
      const result2 = isMatch(s1, s2);

      expect(result1).to.be.true;
      expect(result2).to.be.false;
    });
  } catch (err) {
    console.warn('Test runtime environment does not support Symbols, some tests will not be run');
  }

  it('should match types against their instances', () => {
    const result = isMatch(new Foo(3, 4), Foo);
    expect(result).to.be.true;
  });

  it('should match different instances of the same type if their values match exactly', () => {
    const result1 = isMatch(new Foo(3, 4), new Foo(3, 4));
    const result2 = isMatch(new Foo(3, 4), new Foo(4, 5));
    expect(result1).to.be.true;
    expect(result2).to.be.false;
  });

  it('should not match type instances similar but different types', () => {
    const result = isMatch(new Foo(3, 4), Bar);
    expect(result).to.be.false;
  });

  it('should match type instances with object literals with exact matching values', () => {
    const result = isMatch(new Foo(3, 4), {a: 3, b: 4});
    expect(result).to.be.true;
  });

  it('should match type instances with object literals with partially matching values', () => {
    const result = isMatch(new Foo(3, 4), {a: 3});
    expect(result).to.be.true;
  });

  it('should not match type instances with object literals if the latter has extra fields', () => {
    const result = isMatch(new Foo(3, 4), {a: 3, b: 4, c: 5});
    expect(result).to.be.false;
  });

  it('should match object literals with another with exact matching values', () => {
    const result = isMatch({a: 3, b: 4}, {a: 3, b: 4});
    expect(result).to.be.true;
  });

  it('should match object literals with another with partially matching values', () => {
    const result = isMatch({a: 3, b: 4}, {a: 3});
    expect(result).to.be.true;
  });

  it('should not match object literal with another if the latter has extra fields', () => {
    const result = isMatch(new Foo(3, 4), {a: 3, b: 4, c: 5});
    expect(result).to.be.false;
  });

  it('should recognize functional matchers in object literals', () => {
    const isOdd = x => x % 2 == 1;
    const isEven = x => !isOdd(x);
    const result1 = isMatch(new Foo(3, 4), {a: isOdd, b: isEven});
    const result2 = isMatch(new Foo(3, 4), {a: isEven});
    expect(result1).to.be.true;
    expect(result2).to.be.false;
  });

  it('should match arrays of exact length, values and order', () => {
    const result1 = isMatch(['foo', 'bar'], ['foo', 'bar']);
    const result2 = isMatch(['foo', 'bar'], ['foo']);
    const result3 = isMatch(['foo', 'bar'], ['foo', 'baz']);
    const result4 = isMatch(['foo', 'bar'], ['bar', 'foo']);
    const result5 = isMatch(['foo', 'bar'], 'foo');
    const result6 = isMatch('foo', ['foo']);
    expect(result1).to.be.true;
    expect(result2).to.be.false;
    expect(result3).to.be.false;
    expect(result4).to.be.false;
    expect(result5).to.be.false;
    expect(result6).to.be.false;
  });

  it('should match built-in types with values of their type', () => {
    expect(isMatch(1, Number), '1 is a number').to.be.true;
    expect(isMatch(1, String), '1 not a string').to.be.false;

    expect(isMatch('x', String), `'x' is a string`).to.be.true;
    expect(isMatch('x', Number), `'x' is not a number`).to.be.false;

    expect(isMatch({a: 4}, Object), `{a: 4} is an object`).to.be.true;
    expect(isMatch(new Foo(4, 5), Object), `new Foo(4, 5) is an object`).to.be.true;

    expect(isMatch(/foo/, RegExp, '/foo/ is a RegExp')).to.be.true;
  });

  it('should always match both as value and matcher', () => {
    const values = [
      _, 1, 'foo', /foo/, () => 42, {a: 4}, new Foo(3, 4), null, undefined
    ];
    values.forEach(value => {
      expect(isMatch(_, value)).to.be.true;
      expect(isMatch(value, _)).to.be.true;
    });
  });
});
