import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...[].concat(coreWebVitals),
  ...[].concat(typescript),
  {
    ignores: [".next/**", "out/**", "build/**", "src/generated/**"],
  },
];

export default eslintConfig;
