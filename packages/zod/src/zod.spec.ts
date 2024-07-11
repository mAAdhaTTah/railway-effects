import { expectTypeOf } from "expect-type";
import { ZodParseError, parseWithResult } from "./zod";
import { z } from "zod";
import { Result, error, success } from "@railway-effects/result";

describe("zod", () => {
  describe("parseWithResult", () => {
    it("should type correctly", async () => {
      const result = await parseWithResult(z.string(), "abc");

      expectTypeOf(result).toMatchTypeOf<
        Result<string, ZodParseError<string>>
      >();
    });

    it("should return a result in the success state with the value when it parses successfully", async () => {
      const result = await parseWithResult(z.string(), "abc");

      expect(result).toEqual(success("abc"));
    });

    it("should return a result in the error state with a ParseError when it parses unsuccessfully", async () => {
      const result = await parseWithResult(z.string(), 123);

      expect(result).toEqual(error(expect.any(ZodParseError)));
    });
  });
});
