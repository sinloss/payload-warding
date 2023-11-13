import type { CollectionConfig } from "payload/types";

const Chad: CollectionConfig = {
  slug: "chad",
  auth: false,
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      type: "text",
      name: "name",
      custom: {
        warding: {
          should: { create: true, read: true },
        },
      },
    },
    {
      type: "number",
      name: "age",
      access: {
        read: args => {
          const warding = args.req.context?.warding;
          return warding && warding instanceof Function && warding(args);
        },
      },
    },
  ],
  endpoints: [
    {
      method: "post",
      path: "/encounter",
      handler: (req, res, next) => {
        res.status(200).json({ oh: "Dope!" });
      },
    },
  ],
  access: {
    create: args => {
      const warding = args.req.context?.warding;
      if (warding && warding instanceof Function && warding(args)) {
        return { age: { greater_than: 18 } };
      }
      return false;
    },
  },
  custom: {
    warding: {
      should: false,
    },
  },
};
export default Chad;
