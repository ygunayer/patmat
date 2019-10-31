import {Sync} from './sync';
import {Async} from './async';

import * as Types from './types';

export const _ = Symbol();

class PatMat implements Types.MatchBuilder {
  match<In, Out>(value: Types.Sync<In>): Types.SyncMatcher<In, Out>;
  match<In, Out>(value: PromiseLike<In>): Types.AsyncMatcher<In, Out>;
  match<In, Out>(value: any): Types.SyncMatcher<In, Out>|Types.AsyncMatcher<In, Out> {
    if (typeof value.then === 'function') {
      return Async.match<In, Out>(value);
    }

    return Sync.match<In, Out>(value);
  }
}

const patmat = new PatMat();

export const match = patmat.match;
export {Types, Sync, Async};
