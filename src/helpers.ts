import {isNumber, isString, isSymbol, isArray, isFunction, isObject} from 'lodash';
import {_} from './index';

const handler = { construct() { return handler } };

export function isConstructor(x: any) {
  try { return !!(new (new Proxy(x, handler))()); }
  catch (e) { return false }
};

export function isType(x: any) {
  return isConstructor(x) && (x.hasOwnProperty('prototype'));
}

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
      if (err && (err instanceof TypeError) && /cannot be invoked without \'new\'/.test(err.message)) {
        return false;
      }

      throw err;
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
