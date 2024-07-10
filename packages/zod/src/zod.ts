import type { ZodError, ZodTypeAny, z } from "zod";
import { BaseError } from "@railway-effects/error";
import { AsyncResult, error, success } from "@railway-effects/result";

/**
 * Error returned by {@link parseWithResult}.
 */
export class ParseError<T = unknown> extends BaseError {
  readonly code = "PARSE";
  zod: ZodError<T>;

  constructor(message: string, { zod }: { zod: ZodError<T> }) {
    super(message, { cause: zod });
    this.zod = zod;
  }
}

/**
 * Parse the provided value with the provided schema and wrap it
 * into a Result in a success or error state, depending on the outcome.
 *
 * @param schema Zod schema to parse against
 * @param value Value to parse
 * @returns Result in success state with parsed data
 *          or in error state with {@link ParseError}
 *          containing the returned ZodError
 */
export const parseWithResult = async <T extends ZodTypeAny>(
  schema: T,
  value: unknown,
): AsyncResult<z.infer<T>, ParseError<z.infer<T>>> => {
  const { success: s, data, error: e } = await schema.safeParseAsync(value);
  if (s) return success(data);
  return error(
    new ParseError(`Failed to parse ${schema.description}`, {
      zod: e,
    }),
  );
};
