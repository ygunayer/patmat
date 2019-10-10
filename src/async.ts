import * as Helpers from './helpers';
import {Sync} from './sync';

export module Async {
  export type Async<T> = PromiseLike<T>;
  export type MaybeAsync<T> = T|Async<T>;

  export type Predicate<T> = (value: MaybeAsync<T>) => Async<boolean>;

  export type Handler<In, Out> = (value: MaybeAsync<In>) => Async<Out>;
  export type Result<In, Out> = MaybeAsync<Out>|Handler<In, Out>|Sync.Result<In, Out>;

  export type ClauseLike<T> = Sync.ClauseLike<T>|Async<T>|Predicate<T>|Async<Symbol>|Async<object>|Async<string>|Async<number>;

  export type GuardedCase<In, Out> = [ClauseLike<In>, ClauseLike<In>, Result<In, Out>];
  export type UnguardedCase<In, Out> = [ClauseLike<In>, Result<In, Out>];
  export type Case<In, Out> = Sync.Case<In, Out>|GuardedCase<In, Out>|UnguardedCase<In, Out>;

  interface MatchSpec<In, Out> {
    match: Predicate<In>
    result: Result<In, Out>;
  }

  export module Predicate {
    export function combine<T>(...preds: Predicate<T>[]): Predicate<T> {
      return async (value: MaybeAsync<T>): Promise<boolean> => {
        const resolved = await value;
        while (preds.length) {
          const pred = preds.splice(0, 1)[0];
          if (!(await pred(resolved))) {
            return false;
          }
        }
        return true;
      }
    }

    export function fromClause<T>(clause: ClauseLike<T>): Predicate<T> {
      return async (value: MaybeAsync<T>) => {
        const resolved = await value;
        return Helpers.isMatch(resolved, clause);
      };
    }

    export function toMatchSpec<In, Out>(qase: Case<In, Out>): MatchSpec<In, Out> {
      if (qase.length == 2) {
        const pred = qase[0];
        const match = fromClause(pred);
        return {match, result: qase[1]};
      }

      const clause = fromClause(qase[0]);
      const guard = fromClause(qase[1]);
      const match = combine(clause, guard);
      return {match, result: qase[2]};
    }
  }

  function extractMatchSpecs<In, Out>(cases: Case<In, Out>[]): MatchSpec<In, Out>[] {
    return cases.map(Predicate.toMatchSpec);
  }

  export interface IMatcher<In, Out> {
    case(...cases: Case<In, Out>[]): Async<Out>;
  }

  export function match<Out>(value: MaybeAsync<any>): IMatcher<any, Out> {
    return {
      case: async (...cases: Case<any, Out>[]): Promise<Out> => {
        const specs = extractMatchSpecs(cases);

        const resolved = await value;
        while (specs.length) {
          const spec = specs.splice(0, 1)[0];
          const isMatch = await spec.match(resolved);

          if (isMatch) {
            if (typeof spec.result === 'function') {
              const result = await (spec.result as any)(resolved);
              return result;
            }

            if (typeof (spec.result as any).then === 'function') {
              return await spec.result;
            }

            return spec.result;
          }
        }
      }
    };
  }
}
