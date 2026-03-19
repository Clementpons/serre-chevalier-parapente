import { client } from "@/sanity/lib/client";
import { SitemapStream, streamToPromise } from "sitemap";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const smStream = new SitemapStream({
      hostname: process.env.NEXT_PUBLIC_OFFICIAL_URL,
    });

    // Pages statiques
    const staticPages = [
      { url: "/", changefreq: "yearly", priority: 1 },
      { url: "/blog", changefreq: "weekly", priority: 0.9 },
      { url: "/nos-stages", changefreq: "yearly", priority: 0.8 },
      { url: "/nos-stages/initiation", changefreq: "yearly", priority: 0.8 },
      { url: "/nos-stages/progression", changefreq: "yearly", priority: 0.8 },
      { url: "/nos-stages/autonomie", changefreq: "yearly", priority: 0.8 },
      { url: "/bi-places", changefreq: "yearly", priority: 0.8 },
      { url: "/cgv", changefreq: "yearly", priority: 0.6 },
      { url: "/legal", changefreq: "yearly", priority: 0.6 },
    ];

    staticPages.forEach((page) => {
      smStream.write(page);
    });

    // Articles de blog depuis Sanity
    const blogPosts = await client.fetch(`
      *[_type == "post"] {
        "slug": slug.current,
        _updatedAt
      }
    `);

    blogPosts.forEach((post) => {
      smStream.write({
        url: `/blog/${post.slug}`,
        lastmod: post._updatedAt,
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    smStream.end();

    const sitemap = await streamToPromise(smStream);
    return new NextResponse(sitemap.toString(), {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Erreur lors de la génération du sitemap" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
