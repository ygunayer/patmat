![Version](https://img.shields.io/npm/v/@ygunayer/patmat)

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

It's also imperative that this expression supports asynchronous input and output, but not intermix the two, because a sync function block can't wait for the result of an asynchronous expression (without consuming a lot of CPU with a `while` block, at least). As such, the library was split into two main modules, `Sync` and `Async`, and was written in such a way that when given an asynchronous input, the result of the patmat expression also becomes a `Promise`, with case handles also becoming optionally asynchronous.

> **Note:** Both sync and async modules are typed too heavily to be explained here. To find out more, see the source code of each individual module: [Sync](./src/sync.ts) and [Async](./src/async.ts)

### Examples
See the demos at [src/examples/](./src/examples) for examples. To run an example, simply run `npm run example:{exampleName}`

## TODO
- !!! WRITE MUCH MORE TESTS !!!
- Transformative case handles that can convert the input to an intermediate type which is then fed into the guard and the handler function. See [https://github.com/ygunayer/patmat/issues/1](https://github.com/ygunayer/patmat/issues/1)
- More accurate types in guard clauses and handler functions. See [https://github.com/ygunayer/patmat/issues/2](https://github.com/ygunayer/patmat/issues/2)

## LICENSE
MIT
