import * as Helpers from './helpers';
import {SyncCase, Sync as SyncData, Predicate, SyncMatcher, SyncCaseHandle, SyncClauseLike} from './types';

export module Sync {
  export module Predicate {
    /**
     * Combines a list of asynchronous predicates into a single async predicate.
     * 
     * @param preds the list of predicates
     */
    export function combine<T>(...preds: Predicate<T>[]): Predicate<T> {
      return (value: T): boolean => {
        while (preds.length) {
          const pred = preds.splice(0, 1)[0];
          if (!pred(value)) {
            return false;
          }
        }
        return true;
      }
    }

    export function fromClause<T>(clause: SyncClauseLike<T>): Predicate<T> {
      return (value: SyncData<T>) => Helpers.isMatch(value, clause);
    }
  }

  export function normalizeCase<In, Out>(qase: SyncCase<In, Out>): SyncCaseHandle<In, Out> {
    if (qase.length == 2) {
      const clause = qase[0];
      const test = Predicate.fromClause(clause);
      const consume = qase[1];
      return {test, consume};
    }

    const clause = Predicate.fromClause(qase[0]);
    const guard = Predicate.fromClause(qase[1]);
    const consume = qase[2];
    const test = Predicate.combine(clause, guard);
    return {test, consume};
  }

  /**
   * Matches the given value against the given cases and returns the result of the `consume` method of the first matched case.
   * If no match is found, returns `undefined`, and no `consume` method is invoked
   * 
   * @param value the value to match
   * @param cases the cases to match the value against
   */
  export function matchValue<In, Out>(value: In, cases: SyncCase<In, Out>[]): Out {
    const normalizedCases = cases.map(normalizeCase);

    while (normalizedCases.length > 0) {
      const {test, consume} = normalizedCases.splice(0, 1)[0];

      if (test(value)) {
        if (typeof consume === 'function') {
          return (consume as any)(value);
        }

        return consume;
      }
    }
  }

  /**
   * Constructs a synchronous matcher for the given value.
   * 
   * @param value the input value
   */
  export function match<In, Out>(value: In): SyncMatcher<In, Out> {
    return {
      case: (...cases: SyncCase<In, Out>[]): Out => {
        return Sync.matchValue<In, Out>(value, cases);
      }
    }
  }
}
