/* istanbul ignore file */
/**
 * Generic type for a function of signature `T => R`
 */
export type Fn<T, R> = (t: T) => R;

/**
 * Generic type for functions of signature `T => boolean`
 */
export type Predicate<T> = Fn<T, boolean>;

/**
 * Generic type for an object literal, which roughly translates to a map of `string => any`
 */
export type ObjectLiteral = {
  [key: string]: any;
}

/**
 * Represents the result handle of a pattern. This can either be a scalar value or a function
 */
export type Result<In, Out> = Out|Fn<In, Out>;

/**
 * Represents the clause handles of a pattern
 */
export type ClauseLike<T> = T|Predicate<T>|Symbol|ObjectLiteral|string|number;

/**
 * Represents a case with a guard clause
 */
export type GuardedCase<In, Out> = [ClauseLike<In>, ClauseLike<In>, Result<In, Out>];

/**
 * Represents a case with no guard clause
 */
export type UnguardedCase<In, Out> = [ClauseLike<In>, Result<In, Out>];

/**
 * Represents a case with a main clause and result handles, and optionally a guard clause
 */
export type Case<In, Out> = GuardedCase<In, Out>|UnguardedCase<In, Out>;

/**
 * Represents the type that can execute the given cases on an externally provided value
 */
export interface Matcher<In, Out> {
  /**
   * Matches the given value against the given cases and executes the result handle of the matching case.
   * If no case is matched, returns `undefined` and does not execute any result handles.
   */
  case(...cases: Case<In, Out>[]): undefined|Out;
}
