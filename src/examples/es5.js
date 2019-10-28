var patmat = require('../../dist/index.js');
var _ = patmat._;
var match = patmat.match;

match(42).case(
  [
    function(x) { return x % 2 == 0; },
    function(n) { console.log(n, 'is an even number'); }
  ],
  [
    _,
    function(n) { console.log(`${n} is an odd number`) }
  ]
);
// prints "42 is an even number"

function Point(x, y) {
  this.x = x;
  this.y = y;
}

var v1 = new Point(5, 4);
match(v1).case(
  [Point, {x: function(n) { return n < 5; }}, function(n) { console.log('foo'); }],
  [Point, {y: function(n) { return n < 5; }}, function(n) { console.log('bar'); }],
  [_, function(n) { console.log('baz'); }]
);
// prints "bar"
