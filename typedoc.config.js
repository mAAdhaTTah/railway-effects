/** @type {import('typedoc').TypeDocOptions} */
module.exports = {
  entryPoints: ["packages/*"],
  exclude: ["./packages/typescript-config", "./packages/eslint-config"],
  entryPointStrategy: "packages",
  excludeTags: ["@overload"],
  tsconfig: "./tsconfig.docs.json",
  out: "doc",
};
