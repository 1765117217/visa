export default [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "out/**"]
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly"
      }
    }
  }
];
