import {_, match} from '..';

match(42).case(
  [x => x % 2 == 0, n => console.log(`${n} is an even number`)],
  [_, n => console.log(`${n} is an odd number`)]
);
// prints "42 is an even number"

class Point { constructor(public x: number, public y: number) {} }

const v1 = new Point(5, 4);
match(v1).case(
  [Point, {x: n => n < 5}, n => console.log('foo')],
  [Point, {y: n => n < 5}, n => console.log('bar')],
  [_, n => console.log('baz')]
);
// prints "bar"

const max = match([4, 5]).case(
  [([a, b]) => a >= b, ([a, _]) => a],
  [_, ([_, b]) => b]
);
console.log(`Max: ${max}`);
// prints "Max: 5"
