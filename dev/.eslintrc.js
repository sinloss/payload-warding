module.exports = {
  root: true,
  extends: ["../eslint-config"],
  overrides: [
    // Temporary overrides
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "import/no-relative-packages": "off",
        "no-process-env": "off",
      },
    },
  ],
  excludes: ["dev/plugin.spec.ts"],
};
