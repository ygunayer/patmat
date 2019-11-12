import * as Utils from './lib/utils';
import {Fn, Predicate, ClauseLike, Case, Matcher} from './types';
import {PartialFunction, PartialFunctionStub, fromStubs} from './lib/partial-function';

/**
 * A symbol that can be used as the main clause of a match case to implement catch-all behavior since patmat recognizes it
 * Using `_` is roughly equivalent to passing a `() => true` as the main clause
 */
export const _ = Symbol();

function toTestable<T>(clause: ClauseLike<T>): Predicate<T> {
  return (value: T) => Utils.isMatch(value, clause);
}

function toApplicable<T>(t: T|Fn<any, T>): Fn<any, T> {
  if (typeof t === 'function') {
    return t as any;
  }
  return () => t;
}

/**
 * Converts a case into a partial function stub
 *
 * @param qase the case
 */
export function toPartialFunctionStub<In, Out>(qase: Case<In, Out>): PartialFunctionStub<In, Out> {
  if (qase.length == 2) {
    const [clause, consume] = qase;
    return {
      isDefinedAt: toTestable(clause),
      apply: toApplicable(consume)
    };
  }
  const [clause, guard, consume] = qase;
  const testClause = toTestable(clause);
  const testGuard = toTestable(guard);

  return {
    isDefinedAt: value => {
      if (!testClause(value)) {
        return false;
      }

      return testGuard(value);
    },

    apply: toApplicable(consume)
  }
}

/**
 * Creates a partial function from the given cases
 *
 * @param cases the cases to build from
 */
export function toPartialFunction<In, Out>(cases: Case<In, Out>[]): PartialFunction<In, Out> {
  const stubs = cases.map(toPartialFunctionStub);
  return fromStubs(stubs);
}

/**
 * Constructs a synchronous matcher for the given value.
 * 
 * @param value the input value
 */
export function match<In, Out>(value: In): Matcher<In, Out> {
  return {
    case: (...cases: Case<In, Out>[]): undefined|Out => {
      return toPartialFunction(cases).applyOrElse(value, undefined);
    }
  };
}
