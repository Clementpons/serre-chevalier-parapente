import { getBlogs } from "@/sanity/lib/blogs";
import React from "react";
import BlogCard from "./blog-card";

interface Post {
  title: string;
  slug: {
    current: string;
  };
  author: {
    image: {
      url: string;
    };
    name: string;
  };
  publishedAt: string;
  mainImage: any;
  categories: {
    title: string;
  }[];
}

async function BlogRelativeArticles({ slugToExclude }: { slugToExclude?: string }) {
  const fetchedPosts = await getBlogs({
    limit: 4,
  });

  let posts = fetchedPosts.items || [];

  if (slugToExclude) {
    posts = posts.filter(
      (post: Post) => post.slug.current !== slugToExclude
    );
  } else {
    posts = posts.slice(0, 3);
  }

  return (
    <div className="space-y-4 md:space-y-0 md:flex items-stretch gap-8">
      {posts.map((post: Post) => (
        <BlogCard
          key={post.slug.current}
          title={post.title}
          slug={post.slug.current}
          mainImage={post.mainImage}
          author={post.author}
          categories={post.categories}
          publishedAt={post.publishedAt}
        />
      ))}
    </div>
  );
}

export default BlogRelativeArticles;
