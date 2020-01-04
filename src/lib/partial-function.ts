import {isFunction} from 'lodash';
import {Fn} from '../types';

/**
 * Signals that a partial function is not defined for a given value
 */
export class UndefinedValueError extends Error {
  constructor() {
    super('The partial function is not defined for the given value');
    Object.setPrototypeOf(this, UndefinedValueError.prototype);
  }
}

/**
 * Represents a partial function candidate
 */
export type PartialFunctionStub<A, B> = {
  /**
   * Returns whether or not this function is defined for the given value.
   * 
   * Note that this function cannot be async, so if you wish to use a partial function to determine the output of an async
   * operation, match its result after `await`ing it
   *
   * @param a the value
   */
  isDefinedAt(value: A): boolean;

  /**
   * Attempts to consume the value
   *
   * @param value the value
   */
  apply(value: A): B;
}

/**
 * Represents a partial function that does not necessarily apply to all values of type `A`.
 * The `isDefinedAt` method is expected to return whether or not a function instance applies to a given `A`.
 * The `apply` method can be used to consume a value of `A` and produce an output, however, if the function is not defined
 * for a given value of `A`, it throws an error, so it's the user's responsibility to call `isDefinedAt` and check if it
 * is indeed defined.
 */
export interface PartialFunction<A, B> extends PartialFunctionStub<A, B> {
  /**
   * Returns whether or not this function is defined for the given value
   *
   * @param a the value
   */
  isDefinedAt(a: A): boolean;

  /**
   * Attempts to consume the value
   *
   * @param a the value
   */
  apply(a: A): B;

  /**
   * Creates a new partial function of type `PartialFunction<A, C>` that executes the given function `fn` when executed
   * with a value of `A` that is defined.
   * 
   * If `fn` is a partial function, the result of the initial partial function will be subject to its definition space
   *
   * @param fn the mapping function
   */
  andThen<C>(fn: PartialFunction<B, C>|Fn<B, C>|C): PartialFunction<A, C>;

  /**
   * Attempts to apply the given value to the function, and if it's not defined, executes the fallback function instead
   *
   * @param a the value
   * @param otherwise the fallback function
   */
  applyOrElse(value: A, otherwise: B|Fn<A, B>): B;

  /**
   * Combines this partial function with the given one, which can then execute the fallback partial function if this one
   * is not defined for a given value of `A`.
   *
   * @param otherwise the fallback implementation
   */
  orElse(otherwise: PartialFunction<A, B>): PartialFunction<A, B>;
}

/**
 * An empty partial function stub that always returns `false` for `isUndefined()`, and throws an `UndefinedValueError`
 * error when `apply()` is called
 */
export const Never: PartialFunctionStub<any, never> = {
  isDefinedAt: () => false,
  apply: () => { throw new UndefinedValueError(); }
};

/**
 * Creates a combination of two partial functions of same type.
 * Slightly more optimized than `Combined` since it doesn't perform any mapping.
 *
 * @param pf the main partial function
 * @param otherwise the fallback implementation
 */
export function OrElse<A, B>(
  pf: PartialFunction<A, B>,
  otherwise: PartialFunction<A, B>
): PartialFunction<A, B> {
  return fromStub({
    isDefinedAt(value: A) {
      if (pf.isDefinedAt(value)) {
        return true;
      }

      return otherwise.isDefinedAt(value);
    },

    apply(value: A): B {
      return pf.applyOrElse(value, () => otherwise.applyOrElse(value, Never.apply));
    }
  });
}

/**
 * A combination of two partial functions of possibly different types.
 * Effectively transforms the input value to the output when it's defined
 *
 * @param pf the main partial function
 * @param otherwise the fallback implementation
 */
export function Combined<A, B, C>(
  pf: PartialFunction<A, B>,
  otherwise: PartialFunction<B, C>
): PartialFunction<A, C> {
  return fromStub({
    isDefinedAt(value: A) {
      if (!pf.isDefinedAt(value)) {
        return false;
      }

      const bValue = pf.apply(value);
      return otherwise.isDefinedAt(bValue);
    },

    apply(value: A): C {
      return otherwise.apply(pf.apply(value));
    }
  });
}

/**
 * Tests whether a given object complies to the `PartialFunctionStub` interface.
 * Does not perform generic type checking.
 *
 * @param obj the object
 */
function isPartialFunctionStubLike(obj) {
  if (!obj) {
    return false;
  }

  return typeof (obj as any).isDefinedAt === 'function' && typeof (obj as any).apply === 'function';
}

/**
 * A convenience method for creates a partial function from a regular mapping function. The resulting partial function
 * will always return `true` for `isDefinedAt`.
 *
 * @param apply the mapping function
 */
export function fromFunction<A, B>(apply: Fn<A, B>): PartialFunction<A, B> {
  return fromStub<A, B>({isDefinedAt: () => true, apply});
}

/**
 * Creates a partial function implementation from the given stub
 *
 * @param stub the partial function stub
 */
export function fromStub<A, B>(stub: PartialFunctionStub<A, B>): PartialFunction<A, B> {
  function isDefinedAt(value: A): boolean {
    return stub.isDefinedAt(value);
  }

  function apply(value: A): B {
    return applyOrElse(value, Never.apply);
  }

  function andThen<C>(fn: PartialFunction<B, C>|Fn<B, C>|C): PartialFunction<A, C> {
    let otherwise: PartialFunction<B, C>;
    if (isPartialFunctionStubLike(fn)) {
      otherwise = (fn as PartialFunction<B, C>);
    } else if (isFunction(fn)) {
      otherwise = fromFunction(fn as any);
    } else {
      otherwise = fromFunction(() => fn as C);
    }

    return Combined<A, B, C>(self, otherwise);
  }

  function applyOrElse(value: A, otherwise: B|Fn<A, B>): B {
    if (isDefinedAt(value)) {
      return stub.apply(value);
    }
    if (typeof otherwise === 'function') {
      return (otherwise as any)(value);
    }
    return otherwise;
  }

  function orElse(otherwise: PartialFunction<A, B>): PartialFunction<A, B> {
    return OrElse<A, B>(self, otherwise);
  }

  const self: PartialFunction<A, B> = {isDefinedAt, apply, andThen, orElse, applyOrElse};
  return self;
}

/**
 * Creates a partial function out of the given stubs
 *
 * @param stubs the stubs
 */
export function fromStubs<A, B>(stubs: PartialFunctionStub<A, B>[]): PartialFunction<A, B> {
  function findFirstMatching(value: A): undefined|PartialFunctionStub<A, B> {
    return stubs.find(stub => stub.isDefinedAt(value));
  }

  const stub = {
    isDefinedAt: (value: A): boolean => {
      const matching = findFirstMatching(value);
      return matching ? true : false;
    },

    apply: (value: A): B => {
      const matching = findFirstMatching(value);
      if (!matching) {
        throw new UndefinedValueError();
      }
      return matching.apply(value);
    }
  };

  const result = fromStub(stub);
  // the default implementation of apply makes a second call to `isDefinedAt` so we override it here for performance
  result.apply = stub.apply;
  return result;
}
