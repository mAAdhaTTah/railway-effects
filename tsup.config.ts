import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/error.ts", "src/result.ts", "src/zod.ts"],
  format: ["esm", "cjs"],
  clean: true,
  splitting: true,
  dts: true,
});
