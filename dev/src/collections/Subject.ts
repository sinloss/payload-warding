import type { CollectionConfig } from "payload/types";

const Subject: CollectionConfig = {
  slug: "subject",
  auth: false,
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      type: "text",
      name: "title",
    },
    {
      type: "text",
      name: "content",
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
      method: "get",
      path: "/discuss",
      handler: (req, res, next) => {
        res.status(200).json({ status: "discussed!" });
      },
      custom: {
        warding: { should: false },
      },
    },
  ],
  access: {
    update: args => {
      const warding = args.req.context?.warding;
      if (warding && warding instanceof Function && warding(args)) {
        return { content: { exists: true } };
      }
      return false;
    },
  },
};
export default Subject;
