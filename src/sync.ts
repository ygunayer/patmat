import * as Helpers from './helpers';

export module Sync {
  export type Predicate<T> = (value: T) => boolean;

  export type Handler<In, Out> = (value: In) => Out;
  export type Result<In, Out> = Out|Handler<In, Out>;

  export type ClauseLike<T> = T|Predicate<T>|Symbol|object|string|number;

  export type GuardedCase<In, Out> = [ClauseLike<In>, ClauseLike<In>, Result<In, Out>];
  export type UnguardedCase<In, Out> = [ClauseLike<In>, Result<In, Out>];
  export type Case<In, Out> = GuardedCase<In, Out>|UnguardedCase<In, Out>;

  interface MatchSpec<In, Out> {
    match: Predicate<In>
    result: Result<In, Out>;
  }

  export module Predicate {
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

    export function fromClause<T>(clause: ClauseLike<T>): Predicate<T> {
      return (value: T) => Helpers.isMatch(value, clause);
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
    case(...cases: Case<In, Out>[]): Out;
  }

  export function match<Out>(value: any): IMatcher<any, Out> {
    return {
      case: (...cases: Case<any, Out>[]) => {
        const specs = extractMatchSpecs(cases);

        while (specs.length) {
          const spec = specs.splice(0, 1)[0];
          const isMatch = spec.match(value);

          if (isMatch) {
            if (typeof spec.result === 'function') {
              return (spec.result as any)(value);
            }

            return spec.result;
          }
        }
      }
    };
  }
}
