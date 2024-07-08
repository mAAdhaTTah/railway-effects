import { BaseError } from "./error";

/**
 * Result in the success state.
 */
export class SuccessResult<T> {
  readonly type = "success";

  constructor(public data: T) {}
}

/**
 * Result in the error state.
 */
export class ErrorResult<E> {
  readonly type = "error";

  constructor(public error: E) {}
}

/**
 * Result of an operation, either success or error.
 */
export type Result<T, E> = SuccessResult<T> | ErrorResult<E>;

/**
 * Result of an async operation, either success or error.
 */
export type AsyncResult<T, E> = Promise<Result<T, E>>;

/**
 * Extract the data from the Result in the success state.
 */
export type ExtractSuccessValue<R> = R extends AsyncResult<infer T, any>
  ? T
  : never;

/**
 * Extract the error from the Result in the error state.
 */
export type ExtractErrorValue<R> = R extends AsyncResult<any, infer E>
  ? E
  : never;

/**
 * Creates a new Result in the success state.
 */
export function success<T>(data: T): SuccessResult<T> {
  return new SuccessResult(data);
}

/**
 * Creates a new Result in the error state.
 */
export function error<E>(error: E): ErrorResult<E> {
  return new ErrorResult(error);
}

/**
 * Run the `callback` sync or async function, wrapping the returned value
 * in a Result in the success state. If the function throws, or the Promise
 * rejects, calls the provided `catcher` with the error and wraps the
 * thrown error in a Result in the error state.
 *
 * @example
 * ```ts
 * const result = await tryAsync(
 *   () => doSomething(),
 *   (error) =>
 *     new UnknownError("Unknown error occurred doing something", { cause: error })
 * )
 * ```
 *
 * @param callback Function or async function to try
 * @param catcher Function to call when callback throws;
 *                used to map errors to specific errors
 * @returns Result in success or error state,
 *          depending on result of the callback.
 */
export async function tryAsync<T, E>(
  callback: () => Promise<T> | T,
  catcher: (error: unknown) => E,
): AsyncResult<T, E> {
  try {
    return success(await callback());
  } catch (err) {
    return error(catcher(err));
  }
}

/**
 * Match a Result on its state, and call one of the provided functions
 * depending on the state the Result is in.
 *
 * @example
 * ```ts
 * match(result, {
 *   success: ({ data }) => handleData(data),
 *   error: ({ error }) => handleError(error),
 * });
 * ```
 *
 * @param result Result to match against
 * @param matcher Functions to be called depending on the Result state
 * @returns Return value from the called Matcher function
 */
export function match<T, E, U, F>(
  result: Result<T, E>,
  matcher: {
    success: (result: SuccessResult<T>) => U;
    error: (result: ErrorResult<E>) => F;
  },
): U | F {
  switch (result.type) {
    case "success":
      return matcher.success(result);
    case "error":
      return matcher.error(result);
    /* istanbul ignore next */
    default:
      throw new ReferenceError(`Invalid matcher passed to match`);
  }
}

/**
 * Create a new Result from the data in the success state. When the Result
 * is in the error state, return the Result as-is.
 *
 * @example
 * ```ts
 * const result = map(success(2), (num) => num * num);
 * result.data === 4;
 * ```
 *
 * @param result Result to map over
 * @param cb Callback to call on success state
 * @returns Result with updated success value or existing error state
 */
export function map<T, E, U>(
  result: Result<T, E>,
  cb: (val: T) => U,
): Result<U, E> {
  return match(result, {
    success: ({ data }) => success(cb(data)),
    error: (result) => result,
  });
}

/**
 * Create a new Result from the error in the error state. When the Result
 * is in the success state, return the Result as-is.
 *
 * @example
 * ```ts
 * const result = mapError(error(2), (num) => num * num);
 * result.data === 4;
 * ```
 *
 * @param result Result to map over
 * @param cb Callback to call on success state
 * @returns Result with updated success value or existing error state
 */
export function mapError<T, E, U>(
  result: Result<T, E>,
  cb: (val: E) => U,
): Result<T, U> {
  return match(result, {
    success: (result) => result,
    error: ({ error: e }) => error(cb(e)),
  });
}

/**
 * For a given Result in the success state, unwrap the data _and then_ call the
 * provided callback, returning the Result returned by the callback.
 * If the given Result is in the error state, return it without calling the
 * callback. This enables you to continue a sequence if the previous step
 * was successful.
 *
 * @param result Result to unwrap
 * @param cb Callback function to call with success result
 * @returns Result returned by `cb`, or the error if result is in the error state
 */
export async function andThen<T, E, U, F>(
  result: Result<T, E>,
  cb: (data: T) => AsyncResult<U, F>,
): AsyncResult<U, E | F> {
  return match(result, {
    success: ({ data }) => cb(data),
    error: (result) => result,
  });
}

export async function orElse<T, E, U, F>(
  result: Result<T, E>,
  cb: (error: E) => AsyncResult<U, F>,
): AsyncResult<T | U, F> {
  return match(result, {
    success: (result) => result,
    error: ({ error }) => cb(error),
  });
}

/**
 * @overload
 *
 * @example
 * A sequence provided only the result just returns the result:
 * ```ts
 * andThenSeq(result) === result;
 * ```
 */
export function andThenSeq<A extends AsyncResult<any, any>>(result: A): A;
/**
 * @overload
 *
 * @example
 * When a function is provided, the result is passed to `andThen`:
 * ```ts
 * andThenSeq(result. callback) === andThen(result, callback);
 * ```
 */
export function andThenSeq<
  A extends AsyncResult<any, any>,
  B extends AsyncResult<any, any>,
>(
  result: A,
  fn1: (input: ExtractSuccessValue<A>) => B,
): AsyncResult<
  ExtractSuccessValue<B>,
  ExtractErrorValue<A> | ExtractErrorValue<B>
>;
/**
 * @overload
 *
 * @example
 * When 2 or more functions are provided, the result is passed to `andThen` in sequence:
 * ```ts
 * andThenSeq(result, callback1, callback2);
 * // is equivalent to
 * const result1 = await andThen(result, callback1);
 * const result2 = await andThen(result1, callback2);
 * ```
 */
export function andThenSeq<
  A extends AsyncResult<any, any>,
  B extends AsyncResult<any, any>,
  C extends AsyncResult<any, any>,
>(
  result: A,
  fn1: (input: ExtractSuccessValue<A>) => B,
  fn2: (input: ExtractSuccessValue<B>) => C,
): AsyncResult<
  ExtractSuccessValue<C>,
  ExtractErrorValue<A> | ExtractErrorValue<B> | ExtractErrorValue<C>
>;
/**
 * @overload
 *
 * Every overload beyond here just extends the type. If you need the sequence extended further,
 * please file an [issue](https://github.com/mAAdhaTTah/railway-effects/issues).
 */
export function andThenSeq<
  A extends AsyncResult<any, any>,
  B extends AsyncResult<any, any>,
  C extends AsyncResult<any, any>,
  D extends AsyncResult<any, any>,
>(
  result: A,
  fn1: (input: ExtractSuccessValue<A>) => B,
  fn2: (input: ExtractSuccessValue<B>) => C,
  fn3: (input: ExtractSuccessValue<C>) => D,
): AsyncResult<
  ExtractSuccessValue<D>,
  | ExtractErrorValue<A>
  | ExtractErrorValue<B>
  | ExtractErrorValue<C>
  | ExtractErrorValue<D>
>;
/**
 * @overload
 */
export function andThenSeq<
  A extends AsyncResult<any, any>,
  B extends AsyncResult<any, any>,
  C extends AsyncResult<any, any>,
  D extends AsyncResult<any, any>,
  E extends AsyncResult<any, any>,
>(
  result: A,
  fn1: (input: ExtractSuccessValue<A>) => B,
  fn2: (input: ExtractSuccessValue<B>) => C,
  fn3: (input: ExtractSuccessValue<C>) => D,
  fn4: (input: ExtractSuccessValue<D>) => E,
): AsyncResult<
  ExtractSuccessValue<E>,
  | ExtractErrorValue<A>
  | ExtractErrorValue<B>
  | ExtractErrorValue<C>
  | ExtractErrorValue<D>
  | ExtractErrorValue<E>
>;

/**
 * In a typical sequence of side-effect-producing code, you need to handle errors at
 * each step and only advance to the next step if the previous step was successful.
 * `andThenSeq` simplifies the process of writing these sequences and handling the
 * success & error state at the end of the sequence.
 *
 * @example
 * ```ts
 * // The pipeline starts with a Result instance,
 * // and `callback1` & `callback2` are async Result-returning functions.
 * // `callback2` is called with the data return from `callback1` only if
 * // `callback1` returns a Result in the success state. If `callback1`
 * // instead errors, `callback2` is not called and the error from `callback1`
 * // is returned. This supports sequencing the pipeline with error handling built-in.
 * andThenSeq(result, callback1, callback2);
 * ```
 *
 * @param result Result to start the sequence
 * @param fns Functions to call in sequence
 * @returns Result in success state if sequence completed successfully
 *          or in error state if an error prevented the sequence from completing
 */
export function andThenSeq(
  result: any,
  ...fns: ((r: any) => AsyncResult<any, any>)[]
): unknown {
  return fns.reduce(
    (acc, fn) => acc.then((result: any) => andThen(result, fn)),
    Promise.resolve(result),
  );
}

/**
 * Unwrap a Result, returning the data if it's in the success state
 * or throwing a `ResultUnwrapError` if in the error state.
 *
 * @example
 * ```ts
 * unwrap(result, "This operation resulted in an error");
 * ```
 *
 * @param result Result to unwrap
 * @param message Message to attach to the thrown error
 * @returns Result data if in success state
 * @throws {@link ResultUnwrapError} if in error state
 */
export function unwrap<T>(result: Result<T, any>, message: string) {
  if (result.type === "error")
    throw new ResultUnwrapError(message, { cause: result.error });
  return result.data;
}

/**
 * Unwrap a Result, returning the error if it's in the error state
 * or throwing a `ResultUnwrapError` if in the success state.
 *
 * @param result Result to unwrap
 * @param message Message to attach to the thrown error
 * @returns Result error if in error state
 * @throws {@link ResultUnwrapError} if in success state
 */
export function unwrapError<E>(result: Result<any, E>, message: string) {
  if (result.type === "success")
    throw new ResultUnwrapError(message, { cause: result.data });
  return error;
}

/**
 * Unwrap a Result, returning the data if it's in the success state
 * or returning the provided value if in the success state.
 *
 * @param result Result to unwrap
 * @param or Replacement value
 * @returns Result data if in success state, or `or` value if in error state
 */
export function unwrapOr<T, U>(result: Result<T, any>, or: U) {
  return match(result, {
    success: (result) => result.data,
    error: () => or,
  });
}

/**
 * Converts an array of Results into a Result of an array if all
 * Results are in the success state, or a Result of an {@link AggregateResultsError}
 * if any Result is in the error state.
 *
 * @todo change the name of this function
 * @alpha
 *
 * @param results Array of results to transform
 * @returns
 */
export function fromResults<T, E>(
  results: Result<T, E>[],
): Result<T[], AggregateResultsError<T, E>> {
  const successes: T[] = [];
  const errors: E[] = [];
  for (const result of results) {
    match(result, {
      success: ({ data }) => successes.push(data),
      error: ({ error }) => errors.push(error),
    });
  }
  return errors.length > 0
    ? error(new AggregateResultsError({ successes, errors }))
    : success(successes);
}

/**
 * Error thrown when {@link unwrap} or {@link unwrapError} fail to unwrap the Result.
 */
export class ResultUnwrapError extends BaseError {
  readonly type = "result_unwrap";
}

/**
 * Error returned when {@link fromResults} includes error states in its results.
 */
export class AggregateResultsError<T, E> extends BaseError {
  readonly type = "aggregate_results";

  successes: T[];
  errors: E[];

  constructor(
    { successes, errors }: { successes: T[]; errors: E[] },
    options?: ErrorOptions,
  ) {
    super("Aggregated results error", options);
    this.successes = successes;
    this.errors = errors;
  }
}
