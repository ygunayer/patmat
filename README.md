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

The former option is quite frankly a very bold approach, as it brings a lot of unnecessary overhead to the users of the library, and it carries the possibility of being dramatically incompatible with an official, language-level implementation that ECMA might bring in the future. As such, I opted to continue with the latter approach.

### Asynchronous Pattern Matching
This library was originally split into two main modules, one for sync operations and the other for async ones, with the rationale being that it's impractical to wait for an async operation in a sync block, and that it's even more impractical to represent such behavior in the type signatures.

This approach has been dropped in favor of an always-sync pattern matching with optionally asynchronous result handles, so it's now upto the developer to await the result of an asynchronous operation before matching a pattern against it.

**Important:** Don't pass async functions to the main or guard clauses.

TypeScript does prevent you from doing this, but JavaScript doesn't, and since async functions return a `Promise` instance, and this is a truthy value as far as the pattern matcher is concerned, the first case handle with async clauses will always match a given value and execute the result handle even if it shouldn't.

### Examples
See the demos at [src/examples/](./src/examples) for examples. To run an example, simply run `npm run example:{exampleName}`

## Changelog
See [CHANGELOG.md](./CHANGELOG.md)

## TODO
- Write more tests
- Transformative case handles that can convert the input to an intermediate type which is then fed into the guard and the handler function. See [https://github.com/ygunayer/patmat/issues/1](https://github.com/ygunayer/patmat/issues/1)
- More accurate types in guard clauses and handler functions. See [https://github.com/ygunayer/patmat/issues/2](https://github.com/ygunayer/patmat/issues/2)

## LICENSE
MIT
