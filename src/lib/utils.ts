import {isNumber, isString, isSymbol, isArray, isFunction, isObject} from 'lodash';
import {_} from '../index';

const handler = { construct() { return handler } };

/**
 * Returns whether or not the given object is a constructor.
 * Note that ES5-style functions with a body are considered constructors.
 * 
 * @param x the object
 */
export function isConstructor(x: any) {
  try { return !!(new (new Proxy(x, handler))()); }
  catch (e) { return false }
};

/**
 * Returns whether or not the given object is a type constructor with a prototype
 *
 * @param x the object
 */
export function isType(x: any) {
  return isConstructor(x) && (x.hasOwnProperty('prototype'));
}

/**
 * Returns whether or not the given value matches the given expression. This expression might be one of the following:
 * 
 * - The catch-all symbol _ (which always matches any value)
 * - Any scalar value
 * - A symbol
 * - An object (keys of which will be recursively matched against that of the original value's)
 * - An array (not only the items will be recursively matched against, but also the length)
 * - A regular expression
 * - A function (considered a predicate, it will be invoked to test if the value matches)
 * - A type constructor (either built-in such as String, Object, Number, or user-defined)
 * - A class
 * 
 * @param value the value to match
 * @param match the expression to match against
 */
export function isMatch(value: any, match: any): boolean {
  if (match === _) {
    return true;
  }

  if (match instanceof RegExp) {
    return match.test(value);
  }

  if (isSymbol(match)) {
    return value === match;
  }

  if (isFunction(match)) {
    if (match === String) {
      return isString(value);
    }
    if (match === Object) {
      return isObject(value);
    }
    if (match === Number) {
      return isNumber(value);
    }

    if (isType(match)) {
      const Type = match;
      if (value instanceof Type) {
        return true;
      }
    }

    try {
      // the function `match` can be a regular ES5 function which also checks out as a constructor
      // if it really is a regular function, this call should work without any issues
      return match(value) === true;
    } catch (err) {
      // however, if `match` is indeed a constructor, invoking it directly will throw an exception
      // to prevent entire match clauses from crashing the app, we attempt to capture the exception here and return false
      // as the previous `instanceof` check would've returned true if `value` really was an instance of `match` anyway
      return false;
    }
  }

  if (isObject(match)) {
    return Object.keys(match).some(key => {
      const matchAgainst = match[key];
      return isMatch(value[key], matchAgainst);
    });
  }

  if (isArray(match)) {
    if (!isArray(value)) {
      return false;
    }

    if (value.length !== match.length) {
      return false;
    }

    return match.every((x, idx) => {
      if (x === true) {
        return true;
      }

      return isMatch(value[idx], x);
    });
  }

  return value === match;
}
