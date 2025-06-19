import { z, defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const authorsCollection = defineCollection({
  type: 'data', // 'data' used for pure datea files like json or yaml
  schema: z.object({
    name: z.string(),
    picture: z.string().url().optional(), //authors profile pic authorsCollection
  }),
});

const blogCollection = defineCollection({
  type: 'content', // use 'content' for md or mdx files
  schema: z.object({
    title: z.string(),
    //Coerce will attempt to converta a string from frontmatter into a date object
    pubDate: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()),
    isDraft: z.boolean().default(false),
    //This is the loader part it references an entry in another collection.
    author: reference('authors'),
    heroImage: z.string().optional(),
  }),
});

const artCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    imageUrl: z.string().url(),
    description: z.string(),
    dateCompleted: z.coerce.date(),
    medium: z.array(z.string()),
    price: z.number().positive(),
    prodigiSku: z.string(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          options: z.array(z.string()),
        })
      )
      .optional(),
  }),
});

//export above as single collections object
export const collections = {
  post: postCollection,
  authors: authorsCollection,
  blog: blogCollection,
  art: artCollection,
};
