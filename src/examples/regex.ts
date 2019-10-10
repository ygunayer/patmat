import {_, match} from '..';

const thing = 'red shirt';
const pattern = () => /(red|green|blue)\s+(shirt|pants|skirt|hat)/g;

match(thing).case(
  [pattern(), str => {
    const [_, color, wearable] = pattern().exec(str);
    console.log(`It's a ${color} ${wearable}`);
  }],
  [_, str => console.log(`Don't know what ${str} is`)]
);

// prints "It's a red shirt"
