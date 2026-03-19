import { groq } from "next-sanity";

import { client } from "./client";

const blogsCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

export async function getBlogs({
  search = "",
  categories = [],
  authors = [],
  page = 1,
  limit = 2,
}: {
  search?: string;
  categories?: string[];
  authors?: string[];
  page?: number;
  limit?: number;
}) {
  // Générer une clé unique pour le cache en fonction des paramètres
  const cacheKey = JSON.stringify({ search, categories, authors, page, limit });

  // Vérifier si les données sont dans le cache et encore valides
  const cached = blogsCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("Données récupérées depuis le cache");
    return cached.data;
  }

  const filters: string[] = [];

  if (search) {
    filters.push(`(title match "${search}" || author->name match "${search}" || categories[]->title match "${search}")`);
  }

  if (categories.length > 0) {
    const categoryFilter = categories.map((category) => `"${category}" in categories[]->title`).join(" || ");
    filters.push(`(${categoryFilter})`);
  }

  if (authors.length > 0) {
    const authorFilter = authors.map((author) => `author->name == "${author}"`).join(" || ");
    filters.push(`(${authorFilter})`);
  }

  const combinedFilters = filters.length > 0 ? `&& (${filters.join(" && ")})` : "";

  const start = (page - 1) * limit;
  try {
    const queryFiltered = `*[ _type == "post" ${combinedFilters} ]`;
    const queryFinal = `
      {
        "total": count(${queryFiltered}),
        "items": ${queryFiltered} | order(publishedAt desc) [${start}...${start + limit}] {
          title,
          slug,
          "mainImage": mainImage.asset->{
            url
          },
          publishedAt,
          "author": author->{
            name,
            "image": image.asset->{
              url
            },
          },
          categories[]->{title},
        }
      }
    `;

    const results = await client.fetch(queryFinal);

    // Stocker les résultats dans le cache avec un timestamp
    blogsCache[cacheKey] = { data: results, timestamp: Date.now() };

    return results;
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return [];
  }
}

export async function getBlog(slug: string) {
  const query = groq`*[_type == "post" && slug.current == $slug][0]{
  title,
  metaTitle,
  metaDesc,
  publishedAt,
  CtaLink,
  CtaText,
  CtaButtonText,
  "author": author->{
      name,
      "image": image.asset->{
      url
    }
},
  "mainImage": mainImage.asset->{
    url
  },
  categories[]->{
    title
  },
  body[]{
    ...,
    _type == "image" => {
      "url": asset->url
    }
  }
}`;

  const blog = await client.fetch(query, { slug });

  return blog;
}

export async function getLastBlog() {
  const query = groq`*[_type == "post" && publishedAt != null] | order(publishedAt desc) [0]{
  title,
  slug,
  "mainImage": mainImage.asset->{
    url
  },
  publishedAt,
  "author": author->{
    name,
    "image": image.asset->{
      url
    },
  },
  categories[]->{title},
}`;

  const blog = await client.fetch(query);

  return blog;
}

export async function getCategories() {
  const query = groq`*[_type == "post" && publishedAt != null].categories[]->title`;

  const categories = await client.fetch(query);

  //Supprimer les doublons
  const categoriesUnique = [...new Set(categories)];

  return categoriesUnique as string[];
}

interface Author {
  name: string;
  publishedArticlesCount: number;
  imageURL: string;
}
export async function getAuthors() {
  const query = groq`*[_type == "author"]{
  "name": name,
  "publishedArticlesCount": count(*[_type == "post" && author._ref == ^._id]),
  "imageURL": image.asset->url
}`;

  const authors = await client.fetch(query);

  //Supprimer les doublons
  const authorsUnique = [...new Set(authors)];

  return authorsUnique as Author[];
}
