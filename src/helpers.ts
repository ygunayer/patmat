import {isNumber, isString, isSymbol, isArray, isFunction, isObject} from 'lodash';
import {_} from './index';

const handler = { construct() { return handler } };
export function isConstructor(x: any) {
  try { return !!(new (new Proxy(x, handler))()); }
  catch (e) { return false }
};

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

  if (isConstructor(match)) {
    if (match === String) {
      return isString(value);
    }
    if (match === Object) {
      return isObject(value);
    }
    if (match === Number) {
      return isNumber(value);
    }
    const Type = match;
    return value instanceof Type;
  }

  if (isFunction(match)) {
    return match(value);
  }

  if (isObject(match)) {
    return Object.keys(match).some(key => {
      const matchAgainst = match[key];
      return isMatch(value, matchAgainst);
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
