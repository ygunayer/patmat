[![Version](https://img.shields.io/npm/v/@ygunayer/patmat)](https://www.npmjs.com/package/@ygunayer/patmat) [![Build Status](https://travis-ci.org/ygunayer/patmat.svg?branch=master)](https://travis-ci.org/ygunayer/patmat) [![Coverage Status](https://coveralls.io/repos/github/ygunayer/patmat/badge.svg)](https://coveralls.io/github/ygunayer/patmat) 

# patmat
An attempt at implementing pattern matching in JavaScript.

**Note:** This project doesn't have enough tests yet, so use it at your own risk.

## What is Pattern Matching?
Put simply, pattern matching is the act of checking whether an expression matches a certain pattern. Languages such as Rust, Scala, and Erlang implement this concepts as a core language feature, and while there is a [proposal](https://github.com/tc39/proposal-pattern-matching) to add it at some point, there's currently no such support in JavaScript.

As the name implies, pattern matching attempts to match expressions to *patterns*. These patterns may range from scalar values (think `switch..case` statements) to dynamic expressions, and from type matching to destructed array or object patterns, and to even regular expressions. When a match is found, the function or expression block the pattern points to is invoked either with the input variable, or the output of the match expression (e.g. the result of the regex match), and the result of that expression is then returned as the result of the entire pattern matching expression.

Case handles in pattern matching may also contain catch-all expressions that can either match entire expressions (like the `default` keyword in `switch..case` statements), or a part of the expression (like filler values). In Erlang, Rust and Scala, the special keyword `_` can be used to achieve this purpose (though in Erlang's case it's not technically a keyword, but an arbitrary match variable).

Case handles can also contain an additional inner expression called guard expressions that further increase the accuracy of the match.

Let's see a few examples to demonstrate each quirk

```scala
val x = 42
x match {
  case n if (n % 2 == 0) => println(f"$n is an even number")
  case _ => println("$N is an odd number")
}
// prints "42 is an even number"
```

```scala
case class Point(x: Int, y: Int)

val v1 = Point(5, 4)
v1 match {
  case Point(n, _) if n < 5 => println("foo")
  case Point(_, n) if n < 5 => println("bar")
  case _ => println("baz")
}
// prints "foo"
```

```scala
val max = (4, 5) match {
  case (a, b) if a >= b => a
  case (_, b) => b
}
println(f"Max: $max")
// prints "Max: 5"
```

## patmat's Implementation
As mentioned earlier, most languages implement pattern matching as a core language feature, but since JavaScript doesn't, implementing the same thing either means writing custom Babel plugins or TypeScript extensions, or adhering to the language's technical limitations while doing the best we can.

The former option is quite frankly a very bold approach, as it brings a lot of unnecessary overhead to the users of the library, and it carries the possibility of being dramatically incompatible with an official, language-level implementation that ECMA might bring in the future, so `patmat` was designed with the latter approach.

## Usage
Generally speaking, a matchable pattern consists of a match expression, an optional guard expression (which basically provides a second check), and a function that gets invoked when the match occurs. When a value or expression is matched against a list of patterns, the consumer function of the first matching pattern (if any) gets invoked, and the result of this expression can then be assigned to a variable.

In `patmat`, these patterns are referred to as *case*s, which are actually arrays of length 2 or 3, depending on they're guarded, and the structs that can match a value against a number of cases are referred to as *matcher*s.

Cases take the form of `[ {clause}, {result} ]` or `[ {clause}, {guard clause}, {result} ]`, where `result`s are either scalar values or functions, and clauses are can range from scalar values to object literals, or from functions to regular expressions. The list of supported clause types are listed below:

| Type | Clause Examples | Description |
|------|-----------------|-------------|
| Any scalar value | `true`, `undefined`, `42`, `'foo'`, ... | A scalar value that only matches values that are exactly the same as them (a.k.a. basically a `===` equality check) |
| Symbol | `Symbol()`, `Symbol('foo')` | Like scalar values, but also carrying the properties of the ES2015 symbols. Since the results of two `Symbol()` calls are never equal (even if their parameters are), symbol clauses can only match references to the original symbol |
| `RegExp` | `/foo/g`, `new RegExp('foo')`, ... | A regular expression instance. **Note:** Since `RegExp` instances are stateful, re-using the same `RegExp` instance in multiple clauses or result expressions is highly discouraged |
| `Function` | `x => x % 2` | A predicate function that gets invoked with the input value. The result of this function determines whether or not a match is made |
| `String` | `String` | Not to be confues with a string value, the type reference `String` can be used to capture any string value |
| `Number` | `Number` | Similar to `String`, number clauses only capture numbers. **Note:** This clause does not attempt to parse strings, so the string `'4'` does not get matched. If you wish to capture numeric strings, use a function such as `value => !isNaN(value)`, or a regex clause such as `/\d+/` |
| `Object` | `Object` | Like `Number` or `String`, but with less priority. So numbers and strings are not matched as `Object`s, but almost everything else are |
| Any class or type instance | `Foo`, `Bar`, ... | Matches any instances of a class or type with. Note that this supports both class-style "classes" and pre-ES2015 functions that act as "classes" (e.g. prototypal inheritence) |
| Arrays | `[1, 2]`, `[2, 3, 4]`, `[2, 3, x => x % 2]`, ... | A clause that only matches if the value is an exact match to the clause array instead. This clause works recursively, so the elements of the match clause can also be individual clauses. Note that this is not the same as lodash's `_.deepEquals()`, as the functions in the match clause array only get invoked as predicates, and not matched against using `===` |
| Object literals | `{a: 3}`, `{a: 3, b: x => x % 2}` | Like array clauses, object literals are recursively matched against a value for each field. All fields in the match clause must match the corresponding field in the value, so objects can be partially matched, but any extra fields in the match clause would cause the match to yield false |
| `_` | `_` | Like most pat-mat implementations, `patmat` also has the concept of a global catch-all match clause. In a technical sense, this is just a `Symbol()` that when encountered, matchers return true. The internal `_` symbol is exported with the same name from the root `patmat` module |

See the following code for some examples:

```js
/**
 * isMatch(value: any, clause: any): boolean
 */

const {_} = require('@ygunayer/patmat');

// scalar clauses
isMatch(4, 4); // true
isMatch(4, '4'); // false
isMatch(4, 5); // false

// symbols
const someSymbol = Symbol();
isMatch(Symbol(), Symbol()); // false
isMatch(someSymbol, someSymbol); // true
isMatch(someSymbol, Symbol()); // false

// regular expressions
isMatch('foo', /foo/); // true
isMatch('foo', /bar/); // false

// functions
isMatch(4, x => x % 2 == 0); // true
isMatch(5, x => x % 2 == 0); // true
isMatch(5, x => { throw new Error('some error'); }); // throws error

// built-in types
isMatch('foo', String); // true
isMatch(5, String); // true
isMatch('foo', Number); // false
isMatch(5, Number); // true
isMatch('5', Number); // false
isMatch(5, Object); // false
isMatch('5', Object); // false

// classes and types
class Foo(a, b) { this.a = a; this.b = b; }
class Bar(a, b) { this.a = a; this.b = b; }
function Baz(a, b) { this.a = a; this.b = b; }

isMatch(new Foo(3, 4), Foo); // true
isMatch(new Foo(3, 4), Bar); // false
isMatch(new Foo(3, 4), Baz); // false
isMatch(new Bar(3, 4), Foo); // false
isMatch({a: 3, b: 4}, Foo); // false
isMatch({a: 3, b: 4}, Baz); // false
isMatch(new Baz(3, 4), Baz); // true

// arrays
isMatch([1, 2], [1, 2]); // true
isMatch([1, 2], [1]); // false
isMatch([1, 2], [2, 1]); // false
isMatch([1, 2], [1, x => x % 2 == 0]); // true

// object literals
isMatch({a: 4, b: 5}, {a: 4, b: 5}); // true
isMatch({a: 4, b: 5}, {a: x => x % 2 == 0, b: 5}); // true
isMatch({a: 4, b: 5}, {b: 5}); // true
isMatch({a: 4, b: 5}, {c: 6}); // false
isMatch({a: 4, b: 5}, {a: 4, b: 5, c: 6}); // false
isMatch([1], {length: 1}); // true
isMatch(new Foo(4, 5), {a: 4, b: 4}); // true
isMatch(new Foo(4, 5), {b: x => x % 2 == 1}); // true

// _
isMatch(_, _); // true
isMatch(5, _); // true
isMatch('foo', _); // true
isMatch(null, _); // true
isMatch({}, _); // true
isMatch([]], _); // true
isMatch(5, _); // true
isMatch(Symbol(), _); // true
```

To begin matching a value against a list of patterns, we first need to create a matcher. This can be done using the `match<In, Out>(value: In): Matcher<In, Out>` function. The type of the result of this function is `Matcher<In, Out>`, which has the method `cases(...cases: Case<In, Out>[]): undefined|Out` that we can use to provide the list of patterns, and finally get the result of the match.

With these set, here's a list of examples:

```js
import {_, match} from '@ygunayer/patmat';

match(42).case(
  [x => x % 2 == 0, true],
  [_, false]
); // true

match('bar').case(
  ['foo', 'is foo'],
  [_, str => `is ${str}`]
); // 'is bar'

function dateRegex() { return /\d{4}\-\d{2}-\d{2}/; }
match('2020-01-04').case(
  [dateRegex(), date => {
    const [_, y, m, d] = dateRegex().exec(date);
    return {birthday: `${d}.${m}.${y}`}
  }],

  [_, str => { throw new Error(`Invalid date string ${str}`); }]
); // {birthday: '04.01.2020'}

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
```

### Asynchronous Pattern Matching
In `patmat`, pattern matching itself is always synchronous, so **passing promises or async function calls will break things**. Instead, prefer to await any asynchronous operation before passing their values to the pattern matcher. The result handles, however, *can* be promises or async functions so feel free to use them however you like.

See the following code for a naive example:

```js
const fs = require('fs');
const {_, match} = require('@ygunayer/patmat');

async function downloadJson(url, target) {
  const {statusCode, body} = await request.get(url);
  return match(statusCode).case(
    [200, () => new Promise((resolve, reject) => {
      fs.writeFile(target, body, 'utf-8', (err, result) => {
        if (err) return reject();
        resolve();
      });
    })],

    [x => x > 500, async () => { throw new Error(`Failed to reach server. Status code: ${statusCode}`); }],

    [x => x > 400, async () => { throw new Error(`Invalid request. Status code: ${statusCode}`); }],

    [_, async () => { throw new Error(`Unknown error. Status code: ${statusCode})`); }]
  );
}

fetchSomething('https://foo.bar/baz.jpg').then(...).catch(...);
```

### More Examples
There are a few more examples that you can examine at [src/examples/](./src/examples) for examples.

If you'd like to run an example, simply run `npm run example:{exampleName}`

### Advanced Usage
Inspired heavily by Scala's pattern matching implementation, `patmat` was built on the concept of *partial functions*, which only accept a specific set of values, and can be composed/combined to expand the definition space. Since JavaScript does not contain this concept, it was built from the ground-up using standard JavaScript (or TypeScript, if you will) functions. See [src/lib/partial-function.ts](https://github.com/ygunayer/patmat/tree/0.2.3/src/lib/partial-function.ts) for more details.

`patmat` does export everything related to the partial function implementation, so it's possible to expand beyond the capabilities of the `cases()` functions of the `Matcher<In, Out>`. This can be particularly useful to reuse and/or combine groups of patterns or cases. If you look at the internal implementation of the `cases()` method, you'll realize that it's just a wrapper around the [toPartialFunction()](https://github.com/ygunayer/patmat/tree/0.2.3/src/index.ts#L57) function which takes a list of cases and produces a single partial function.

See the code below for a naive example:
```js
import {_, match, toPartialFunction} from '@ygunayer/patmat';

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
  .map(({name, age, city}) => console.log(`[1] ${name} ${age} lives in ${city}`)); // prints '[2] Baz 24 lives in Izmir'

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
  .map(({name, age, city}) => console.log(`[2] ${name} ${age} lives in ${city}`)); // prints '[2] Baz 24 lives in Izmir'

// if we wanted to further refine the query to only include people with the name 'Bar', we could reuse the old one and build up on it
const query2 = query.andThen(toPartialFunction([
  [{name: 'Bar'}, x => x]
]));
people
  .filter(query2.isDefinedAt)
  .map(({name, age, city}) => console.log(`[3] ${name} ${age} lives in ${city}`)); // does not print anything
```

## Changelog
See [CHANGELOG.md](./CHANGELOG.md)

## TODO
- JSDoc
- Transformative case handles that can convert the input to an intermediate type which is then fed into the guard and the handler function. See [https://github.com/ygunayer/patmat/issues/1](https://github.com/ygunayer/patmat/issues/1)
- More accurate types in guard clauses and handler functions. See [https://github.com/ygunayer/patmat/issues/2](https://github.com/ygunayer/patmat/issues/2)

## LICENSE
MIT
