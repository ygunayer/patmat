require('mocha');
const {expect} = require('chai');
const {_, match} = require('../dist/index.js');

describe('sync', () => {
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
});
