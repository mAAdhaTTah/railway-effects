/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ["src/error.ts", "src/result.ts", "src/zod.ts"],
  excludeTags: ["@overload"],
  out: "doc",
};
