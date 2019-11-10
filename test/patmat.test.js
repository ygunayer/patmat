require('mocha');
const {expect} = require('chai');
const {_, match} = require('../dist/index.js');

class Foo { constructor(a, b) { this.a = a; this.b = b; } }
class Bar { constructor(a, b) { this.a = a; this.b = b; } }

describe('patmat', () => {

  describe('match', () => {
    it('should match scalar numbers', () => {
      const result = match(5).case(
        [5, true],
        [_, false]
      );

      expect(result).to.be.true;
    });

    it('should match scalar numbers even if it\'s zero', () => {
      const result = match(0).case(
        [0, true],
        [_, false]
      );

      expect(result).to.be.true;
    });

    it('should fall back to default case if no match is found', () => {
      const result = match(4).case(
        [1, false],
        [_, true]
      );

      expect(result).to.be.true;
    });

    it('should match functional match clauses', () => {
      const result1 = match(4).case(
        [x => x % 2 == 0, true],
        [x => x % 2 == 1, false],
        [_, n => { throw new Error(`${n} is not a number`) }]
      );
      
      const result2 = match(5).case(
        [x => x % 2 == 1, true],
        [x => x % 2 == 0, false],
        [_, n => { throw new Error(`${n} is not a number`) }]
      );

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });

    it('should also consider functional guard clauses', () => {
      const result1 = match(4).case(
        [x => x % 2 == 0, x => x == 4, true],
        [_, false]
      );
      
      const result2 = match(8).case(
        [x => x % 2 == 0, x => x == 4, false],
        [_, true]
      );

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });

    it('should support ES5 functions and guard clauses', () => {
      const result1 = match(4).case(
        [function(x) { return x % 2 == 0; }, true],
        [_, false]
      );
      
      const result2 = match(8).case(
        [function(x) { return x % 2 == 0; }, function(x) { return x === 4; }, false],
        [function(x) { return x % 2 == 0; }, function(x) { return x === 8; }, true],
        [_, function() { throw new Error('Should match something'); }]
      );

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });

    it('should allow scalar guard clauses', () => {
      const result1 = match(4).case(
        [x => x % 2 == 0, 4, true],
        [_, false]
      );
      
      const result2 = match(8).case(
        [x => x % 2 == 0, 4, false],
        [_, true]
      );

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });

    it('should match regular expressions', () => {
      const result = match('bar').case(
        [/foo/, false],
        [/bar/, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    try {
      eval('Symbol');

      it('should match symbols', () => {
        const s1 = Symbol('foo');
        const s2 = Symbol('foo');

        const result = match(s2).case(
          [s1, false],
          [s2, true],
          [_, () => { throw new Error('Should match something'); }]
        );

        expect(result).to.be.true;
      });
    } catch (err) {
      console.warn('Test runtime environment does not support Symbols, some tests will not be run');
    }

    it('should match types', () => {
      class Foo { constructor(a, b) { this.a = a; this.b = b; } }

      const result = match(new Foo(3, 4)).case(
        [Foo, true],
        [_, false]
      );

      expect(result).to.be.true;
    });

    it('should match the actual type even if it resembles another', () => {
      const result = match(new Foo(3, 4)).case(
        [Bar, false],
        [Foo, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    it('should match a type and its guard clause', () => {
      const result = match(new Foo(3, 4)).case(
        [Foo, foo => foo.a == 4, false],
        [Foo, foo => foo.a == 3, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    it('should destruct object literals in guard clauses and match them partially', () => {
      const result = match(new Foo(3, 4)).case(
        [Foo, {a: 4}, false],
        [Foo, {a: 3}, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    it('should be able to recognize functions in partial guard clause matches', () => {
      const result = match(new Foo(3, 4)).case(
        [Foo, {a: n => n % 2 == 0}, false],
        [Foo, {a: n => n % 2 == 1}, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    it('should be able to recognize functions in partial guard clause matches', () => {
      const result = match(new Foo(3, 4)).case(
        [Foo, {a: n => n % 2 == 0}, false],
        [Foo, {a: n => n % 2 == 1}, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });

    it('should be able to recognize regular expressions in partial guard clause matches', () => {
      const result = match(new Foo('foo', 'bar')).case(
        [Foo, {a: /bar/}, false],
        [Foo, {a: /foo/}, true],
        [_, () => { throw new Error('Should match something'); }]
      );

      expect(result).to.be.true;
    });
  });
  
});
