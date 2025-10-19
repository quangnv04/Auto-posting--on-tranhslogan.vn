import globals from "globals";
import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            indent: ["error", 4],
            "linebreak-style": ["error", "unix"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
            "no-unused-vars": "warn",
            "no-undef": "warn",
        },
    },
];
