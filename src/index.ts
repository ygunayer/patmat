import {Sync} from './sync';
import {Async} from './async';

import {Sync as SyncData, Async as AsyncData, MatchBuilder, SyncMatcher, AsyncMatcher, SyncCase, AsyncCase} from './types';

export const _ = Symbol();

class PatMat implements MatchBuilder {
  match<In, Out>(value: SyncData<In>): SyncMatcher<In, Out>;
  match<In, Out>(value: PromiseLike<In>): AsyncMatcher<In, Out>;
  match<In, Out>(value: any): SyncMatcher<In, Out>|AsyncMatcher<In, Out> {
    if (typeof value.then === 'function') {
      return Async.match<In, Out>(value);
    }

    return Sync.match<In, Out>(value);
  }
}

const patmat = new PatMat();
export const match = patmat.match;
export {Sync, Async};
