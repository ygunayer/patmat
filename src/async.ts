import * as Helpers from './helpers';
import {AsyncCase, MaybeAsync, AsyncPredicate, AsyncCaseHandle, AsyncClauseLike, AsyncMatcher} from './types';

export module Async {
  export module Predicate {
    /**
     * Combines a list of asynchronous predicates into a single async predicate.
     * 
     * @param preds the list of predicates
     */
    export function combine<T>(...preds: AsyncPredicate<T>[]): AsyncPredicate<T> {
      return async (value: MaybeAsync<T>): Promise<boolean> => {
        const resolved = await value;
        while (preds.length) {
          const pred = preds.splice(0, 1)[0];
          if (!(await pred(resolved))) {
            return false;
          }
        }
        return true;
      };
    }

    export function fromClause<T>(clause: AsyncClauseLike<T>): AsyncPredicate<T> {
      return async (value: MaybeAsync<T>) => {
        const resolved = await value;
        return Helpers.isMatch(resolved, clause);
      };
    }
  }

  export function normalizeCase<In, Out>(qase: AsyncCase<In, Out>): AsyncCaseHandle<In, Out> {
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
  export async function matchValue<In, Out>(value: PromiseLike<In>, cases: AsyncCase<In, Out>[]): Promise<Out> {
    const normalizedCases = cases.map(normalizeCase);
    const resolved = await value;

    while (normalizedCases.length > 0) {
      const {test, consume} = normalizedCases.splice(0, 1)[0];

      if (await test(resolved)) {
        if (typeof consume === 'function') {
          return (consume as any)(value);
        }

        return consume;
      }
    }
  }

  export function match<In, Out>(promise: PromiseLike<In>): AsyncMatcher<In, Out> {
    return {
      case: (...cases: AsyncCase<In, Out>[]): Promise<Out> => {
        return Async.matchValue<In, Out>(promise, cases);
      }
    };
  }
}
