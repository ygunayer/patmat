import {_, match} from '..';

// classic fizzbuzz
const numbers = new Array(100).fill(0).map((_, idx) => idx + 1);
numbers.forEach(number => {
  match(number).case(
    [x => x % 5 == 0, x => x % 3 == 0, () => console.log('FizzBuzz')],
    [x => x % 3 == 0, () => console.log('Fizz')],
    [x => x % 5 == 0, () => console.log('Buzz')],
    [_, x => console.log(x)]
  );
});
