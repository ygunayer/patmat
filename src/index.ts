import {Sync} from './sync';
import {Async} from './async';

export const _ = Symbol();

export type Input<T> = T|Async.MaybeAsync<T>;
export type Output<T> = T|Promise<T>;
export type Case<T> = Sync.Case<any, T>|Async.Case<any, T>;

export function match<T>(value: Input<any>) {
  return {
    case: (...cases: Case<T>[]): Output<T> => {
      if (typeof (value as any).then === 'function') {
        return Async.match<T>(value).case(...(cases as Async.Case<any, T>)) as Promise<T>;
      }

      return Sync.match<T>(value).case(...(cases as Sync.Case<any, T>));
    }
  }
}
