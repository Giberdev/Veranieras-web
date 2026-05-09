import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import z from 'zod';

const productos = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/productos" }),
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    category: z.string(),
    description: z.string(),
    image: image(), // Esto permite procesar imágenes de assets
    isNew: z.boolean().optional(),
  }),
});

export const collections = {
  'productos': productos,
};
