// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
var Doc = defineDocumentType(() => ({
  name: "Doc",
  filePathPattern: `**/*.mdx`,
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: false }
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.sourceFileName.replace(/\.mdx$/, "")
      // 파일 이름에서 slug 추출
    },
    body: {
      type: "json",
      resolve: async (doc) => {
        return {
          raw: doc.body.raw,
          code: (await import("@mdx-js/mdx")).compileSync(doc.body.raw).value
        };
      }
    }
  }
}));
var contentlayer_config_default = makeSource({
  contentDirPath: "src/content",
  documentTypes: [Doc]
});
export {
  Doc,
  contentlayer_config_default as default
};
//# sourceMappingURL=compiled-contentlayer-config-PKALHK4B.mjs.map
