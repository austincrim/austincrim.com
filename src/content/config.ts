import { z, defineCollection } from "astro:content"

const postsCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    datePublished: z.date(),
    lede: z.string(),
    draft: z.boolean(),
  }),
})
const projectsCollection = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    sourceUrl: z.string().url().optional(),
    projectUrl: z.string().url().optional(),
    type: z.enum(["oss", "talk", "podcast", "guest post", "video"]),
    order: z.number(),
    disabled: z.boolean().optional(),
  }),
})
// Export a single `collections` object to register your collection(s)
export const collections = {
  posts: postsCollection,
  projects: projectsCollection,
}
