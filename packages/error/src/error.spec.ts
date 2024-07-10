import { expectTypeOf } from "expect-type";
import { BaseError, UnknownError } from "./error";

describe("error", () => {
  describe("BaseError", () => {
    it("should require type to extend", () => {
      // @ts-expect-error we are explicitly testing the error
      class TestError extends BaseError {}

      expectTypeOf<TestError["code"]>().toBeString();
    });

    it("should type as literal", () => {
      class TestError extends BaseError {
        readonly code = "TEST";
      }

      expectTypeOf<TestError["code"]>().toEqualTypeOf<"TEST">();
    });
  });

  describe("UnknownError", () => {
    it("should type as literal", () => {
      expectTypeOf<UnknownError["code"]>().toEqualTypeOf<"UNKNOWN">();
    });

    it("should construct a UnknownError with cause", () => {
      const cause = new Error("oops!");
      const error = new UnknownError("Huh?", { cause });

      expect(error.cause).toBe(cause);
    });
  });
});
