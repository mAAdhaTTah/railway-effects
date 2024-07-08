import { expectTypeOf } from "expect-type";
import { BaseError, UnknownError } from "./error";

describe("error", () => {
  describe("BaseError", () => {
    it("should require type to extend", () => {
      // @ts-expect-error
      class TestError extends BaseError {}

      expectTypeOf<TestError["type"]>().toBeString();
    });

    it("should type as literal", () => {
      class TestError extends BaseError {
        readonly type = "test";
      }

      expectTypeOf<TestError["type"]>().toEqualTypeOf<"test">();
    });
  });

  describe("UnknownError", () => {
    it("should type as literal", () => {
      expectTypeOf<UnknownError["type"]>().toEqualTypeOf<"unknown">();
    });

    it("should construct a UnknownError with cause", () => {
      const cause = new Error("oops!");
      const error = new UnknownError("Huh?", { cause });

      expect(error.cause).toBe(cause);
    });
  });
});
