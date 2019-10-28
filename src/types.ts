export type Sync<T> = Exclude<T, PromiseLike<T>>;
export type Async<T> = PromiseLike<T>;
export type MaybeAsync<T> = T|Async<T>;


export type Fn<T, R> = (t: T) => R;
export type Predicate<T> = Fn<T, boolean>;
export type AsyncFn<T, R> = (t: MaybeAsync<T>) => Async<R>;
export type AsyncPredicate<T> = AsyncFn<T, boolean>;


export type SyncResult<In, Out> = Out|Fn<In, Out>;
export type AsyncResult<In, Out> = SyncResult<In, Out>|AsyncFn<In, Out>;


export type ObjectLiteral = {
  [key: string]: any;
}


export type SyncClauseLike<T> = T|Predicate<T>|Symbol|ObjectLiteral|string|number;
export type SyncGuardedCase<In, Out> = [SyncClauseLike<In>, SyncClauseLike<In>, SyncResult<In, Out>];
export type SyncUnguardedCase<In, Out> = [SyncClauseLike<In>, SyncResult<In, Out>];
export type SyncCase<In, Out> = SyncGuardedCase<In, Out>|SyncUnguardedCase<In, Out>;

export type AsyncClauseLike<T> = SyncClauseLike<T>|Async<T>|AsyncPredicate<T>|Async<Symbol>|Async<ObjectLiteral>|Async<string>|Async<number>;
export type AsyncGuardedCase<In, Out> = [AsyncClauseLike<In>, AsyncClauseLike<In>, AsyncResult<In, Out>];
export type AsyncUnguardedCase<In, Out> = [AsyncClauseLike<In>, AsyncResult<In, Out>];
export type AsyncCase<In, Out> = SyncCase<In, Out>|AsyncGuardedCase<In, Out>|AsyncUnguardedCase<In, Out>;


export type SyncCaseHandle<In, Out> = {test: Predicate<In>, consume: SyncResult<In, Out>};

export type AsyncCaseHandle<In, Out> = {test: AsyncPredicate<In>, consume: AsyncResult<In, Out>};


export interface SyncMatcher<In, Out> {
  case(...cases: SyncCase<In, Out>[]): Out;
}

export interface AsyncMatcher<In, Out> {
  case(...cases: AsyncCase<In, Out>[]): Promise<Out>;
}


export interface MatchBuilder {
  match<In, Out = In>(value: Sync<In>): SyncMatcher<In, Out>;
  match<In, Out = In>(value: PromiseLike<In>): AsyncMatcher<In, Out>;
}
