import { webpackBundler } from "@payloadcms/bundler-webpack";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { slateEditor } from "@payloadcms/richtext-slate";
import path from "path";
import { buildConfig } from "payload/config";

import warding from "../../src";
import convention from "../../src/convention";

import Chad from "./collections/Chad";
import Subject from "./collections/Subject";

function link(...modules: string[]): { [k: string]: string } {
  const m: { [k: string]: string } = {};
  return modules.reduce((m, module) => {
    m[module] = path.resolve(__dirname, `../node_modules/${module}`);
    return m;
  }, m);
}

export default buildConfig({
  admin: {
    bundler: webpackBundler(),
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...(config?.resolve?.alias || {}),
          ...link("react", "react-dom", "payload", "express"),
        },
      },
    }),
  },
  editor: slateEditor({}),
  collections: [Chad, Subject],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
  plugins: [
    warding(
      convention.opts({
        root: { email: process.env.DEV_ROOT!, password: process.env.DEV_PSWD! },
      }),
    ),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI!,
  }),
});
