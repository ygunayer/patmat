import {_, match, toPartialFunction} from '..';

const people = [
  {name: 'Foo', age: 21, city: 'Istanbul'},
  {name: 'Bar', age: 27, city: 'Istanbul'},
  {name: 'Baz', age: 24, city: 'Izmir'},
  {name: 'Quux', age: 34, city: 'Izmir'},
  {name: 'Hoge', age: 19, city: 'Tokyo'},
  {name: 'Piyo', age: 24, city: 'Kyoto'}
];

// to find the people aged between 20-30 who lives in Izmir we can do the following
people
  .filter(person => {
    return match(person).case(
      [{age: x => (x >= 20 && x <= 30), city: 'Izmir'}, true],
      [_, false]
    );
  })
  .map(({name, age, city}) => console.log(`[1] ${name} ${age} lives in ${city}`));

// which we could rewrite this as the following
const livesInIzmir = toPartialFunction([
  [{city: 'Izmir'}, x => x]
]);
const isAgedBetween20and30 = toPartialFunction([
  [{age: x => (x >= 20 && x <= 30)}, x => x]
]);
const query = livesInIzmir.andThen(isAgedBetween20and30);
people
  .filter(query.isDefinedAt)
  .map(({name, age, city}) => console.log(`[2] ${name} ${age} lives in ${city}`));

// if we wanted to further refine the query to only include people with the name 'Bar', we could reuse the old one and build up on it
const query2 = query.andThen(toPartialFunction([
  [{name: 'Bar'}, x => x]
]));
people
  .filter(query2.isDefinedAt)
  .map(({name, age, city}) => console.log(`[3] ${name} ${age} lives in ${city}`)); // this line does not print anything
