import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  ...coreWebVitals,
  ...typescript,
  // ponytail: Notion payloads are untyped, so `any` stays a warning
  { rules: { "@typescript-eslint/no-explicit-any": "warn", "react/no-children-prop": "off" } },
  { ignores: [".next/**", "next-env.d.ts"] },
];

export default config;
