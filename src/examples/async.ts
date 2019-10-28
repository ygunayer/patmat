import {_, match} from '..';

let time = 0;

const delay = async (ms: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(() => {
      time += ms;
      resolve();
    }, ms);
  });
};

type Something = {a: Number, b: Number};

function generateNumber() {
  return 1 + Math.floor(Math.random() * 100);
}

async function doSomethingAsync(): Promise<Something> {
  await delay(2000);
  console.log(`[${time}] Generated some value`);
  return {
    a: generateNumber(),
    b: generateNumber()
  };
}

async function demo() {
  return match<Something, Something>(doSomethingAsync()).case(
    [
      ({a}) => a % 2 == 1,
      async result => {
        console.log(`[${time}] a is odd`)
        await delay(1000);
        return result;
      }
    ],

    [
      ({b}) => b % 2 == 1,
      async result => {
        console.log(`[${time}] a is even, b is odd`)
        await delay(1000);
        return result;
      }
    ],

    [
      _,
      async result => {
        console.log(`[${time}] Both a and b are even`)
        await delay(1000);
        return result;
      }
    ]
  );
}

console.log(`[${time}] Running demo`);
demo()
  .then(result => console.log(`[${time}] Demo finished with result`, result))
  .catch(err => console.error('An error has occurred', err));

// will exit with an output similar to:
// [0] Running demo
// [2000] Generated some value
// [2000] a is even, b is odd
// [3000] Demo finished with result { a: 52, b: 67 }