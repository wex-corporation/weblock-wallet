// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
var Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: false },
    category: { type: "string", required: false }
  },
  computedFields: {
    slugAsParams: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath
      // Use `flattenedPath` for structured slugs
    },
    body: { type: "json", resolve: (doc) => doc.body }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "src/content/docs",
  documentTypes: [Doc]
});
export {
  Doc,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-CS37KICG.mjs.map
