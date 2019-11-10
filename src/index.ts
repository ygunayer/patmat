/* istanbul ignore file */
import * as Types from './types';
import * as Patmat from './patmat';
import * as Lib from './lib';

/**
 * A symbol that can be used as the main clause of a match case to implement catch-all behavior since patmat recognizes it
 * Using `_` is roughly equivalent to passing a `() => true` as the main clause
 */
export const _ = Symbol();
export const match = Patmat.match;
export {Types, Lib};
