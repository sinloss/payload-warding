module.exports = {
  root: true,
  extends: ["./eslint-config"],
  overrides: [
    // Temporary overrides
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "import/no-relative-packages": "off",
      },
    },
  ],
};
