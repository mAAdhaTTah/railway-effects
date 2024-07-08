/**
 * The abstract BaseError class is the root of all your error classes, It ensures
 * cause is ponyfilled and enforces the requirement for adding a `type` property.
 * This will be how you handle particular errors caused in your pipeline.
 *
 * @example
 * Make sure the child class sets a `readonly type` string literal property.
 *
 * ```ts
 * class ExampleError extends BaseError {
 *   readonly type = "example";
 * }
 * ```
 */
export abstract class BaseError extends Error {
  abstract readonly type: string;
  /**
   * @hidden
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);

    /* istanbul ignore if */
    if (
      options != null &&
      "cause" in options &&
      !("cause" in this && options.cause === this.cause)
    ) {
      Object.defineProperty(this, "cause", {
        value: options.cause,
        writable: true,
        enumerable: false,
        configurable: true,
      });
    }
  }
}

/**
 * This UnknownError be used to handle unexpected errors. Use this fallback
 * whenever you use `try/catch` or `railways-effects/result#tryAsync`.
 *
 * @example
 * ```ts
 * tryAsync(
 *   () => doSomething(),
 *   err => {
 *     if(isSpecificError(err)) return new SpecificError("Specific error occurred", { cause: err });
 *     return new UnknownError("An unknown error occurred when doing something", { cause: err });
 *   },
 * );
 * ```
 */
export class UnknownError extends BaseError {
  readonly type = "unknown";
}
