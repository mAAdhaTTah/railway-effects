import { expectTypeOf } from "expect-type";
import { UnknownError } from "./error";
import {
  ErrorResult,
  Result,
  SuccessResult,
  error,
  andThen,
  map,
  mapError,
  match,
  success,
  tryAsync,
  orElse,
} from "./result";

describe("result", () => {
  describe("success", () => {
    it("should create a SuccessResult", () => {
      expect(success("Hello")).toEqual(new SuccessResult("Hello"));
    });
  });

  describe("error", () => {
    it("should create a ErrorResult", () => {
      expect(error(new Error("Test Error"))).toEqual(
        new ErrorResult(new Error("Test Error")),
      );
    });
  });

  describe("tryAsync", () => {
    it("should return a Result with the types of the callback & catcher", async () => {
      const result = await tryAsync(
        () => 1 as const,
        (error) => new UnknownError("Unknown error", { cause: error }),
      );

      expectTypeOf(result).toMatchTypeOf<Result<1, UnknownError>>();
    });

    it("should handle a sync function", async () => {
      const result = await tryAsync(
        () => 1 as const,
        (error) => new UnknownError("Unknown error", { cause: error }),
      );

      expect(result).toEqual(success(1));
    });

    it("should handle an async function", async () => {
      const result = await tryAsync(
        async () => 1 as const,
        (error) => new UnknownError("Unknown error", { cause: error }),
      );

      expect(result).toEqual(success(1));
    });

    it("should handle a thrown error", async () => {
      const toThrow = new Error();
      const result = await tryAsync(
        async () => {
          throw toThrow;
        },
        (error) => new UnknownError("Unknown error", { cause: error }),
      );

      expect(result).toEqual(
        error(new UnknownError("Unknown error", { cause: toThrow })),
      );
    });
  });

  describe("match", () => {
    it("should type the union of the returned values", () => {
      const result = match(success(1), {
        success: () => 2 as const,
        error: () => 3 as const,
      });

      expectTypeOf(result).toMatchTypeOf<2 | 3>();
    });

    it("should call success branch when passed a SuccessResult", () => {
      const result = match(success(1), {
        success: () => 2 as const,
        error: () => 3 as const,
      });

      expect(result).toBe(2);
    });

    it("should call error branch when passed an ErrorResult", () => {
      const result = match(error(1), {
        success: () => 2 as const,
        error: () => 3 as const,
      });

      expect(result).toBe(3);
    });
  });

  describe("map", () => {
    it("should type the returned Result with the new value & existing error", () => {
      const result = map(
        success(1) as Result<1, UnknownError>,
        () => 2 as const,
      );

      expectTypeOf(result).toMatchTypeOf<Result<2, UnknownError>>();
    });

    it("should create a new Result in the success state with the returned map value", () => {
      const result = map(success(1), (data) => data + 2);

      expect(result).toEqual(success(3));
    });

    it("should return the same Result when in an error state", () => {
      const result = map(
        error(new Error("oops!")) as Result<number, Error>,
        (data) => data + 2,
      );

      expect(result).toEqual(error(new Error("oops!")));
    });
  });

  describe("mapError", () => {
    it("should type the returned Result with the new error & existing value", () => {
      const result = mapError(error(3) as Result<2, 3>, () => 4 as const);

      expectTypeOf(result).toMatchTypeOf<Result<2, 4>>();
    });

    it("should create a new Result in the error state with the returned map value", () => {
      const result = mapError(error(3), () => 4 as const);

      expect(result).toEqual(error(4));
    });

    it("should return the same Result when in a success state", () => {
      const result = mapError(
        success(1) as Result<1, UnknownError>,
        () => 4 as const,
      );

      expect(result).toEqual(success(1));
    });
  });

  describe("andThen", () => {
    it("should type correctly", async () => {
      const result = await andThen(
        success("success1") as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expectTypeOf(result).toMatchTypeOf<
        Result<"success2", "error1" | "error2">
      >();
    });

    it("should call and return the callback value when Result is in success state", async () => {
      const result = await andThen(
        success("success1") as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expect(result).toEqual(success("success2"));
    });

    it("should return the Result as-is in error state", async () => {
      const result = await andThen(
        error("error1" as const) as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expect(result).toEqual(error("error1"));
    });
  });

  describe("orElse", () => {
    it("should type correctly", async () => {
      const result = await orElse(
        success("success1") as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expectTypeOf(result).toMatchTypeOf<
        Result<"success1" | "success2", "error2">
      >();
    });

    it("should call and return the callback value when Result is in error state", async () => {
      const result = await orElse(
        error("error1") as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expect(result).toEqual(success("success2"));
    });

    it("should return the Result as-is in success state", async () => {
      const result = await orElse(
        success("success1") as Result<"success1", "error1">,
        async () => success("success2") as Result<"success2", "error2">,
      );

      expect(result).toEqual(success("success1"));
    });
  });

  describe("andThenSeq", () => {
    it.todo("should work correctly");
  });

  describe("unwrap", () => {
    it.todo("should work correctly");
  });

  describe("unwrapError", () => {
    it.todo("should work correctly");
  });

  describe("unwrapOr", () => {
    it.todo("should work correctly");
  });

  describe("fromResults", () => {
    it.todo("should work correctly");
  });
});
