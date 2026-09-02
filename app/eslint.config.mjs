import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = [
  ...[].concat(coreWebVitals),
  ...[].concat(typescript),
  ...[].concat(prettier),
  {
    ignores: [".next/**", "out/**", "build/**", "src/generated/**", "e2e/**"],
  },
];

export default eslintConfig;
