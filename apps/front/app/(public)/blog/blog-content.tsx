"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BlogFilters from "@/components/blog/blog-filters"; // Import du composant
import BlogCard from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import {
  Frown,
  LoaderIcon,
  LucideChevronLeft,
  LucideChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface Posts {
  items: Post[];
  total: number;
}
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
  categories: string[];
}

function BlogContent() {
  const [lastPost, setLastPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Posts>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [postsPerPage] = useState(12); // Peut être configuré si besoin
  const [currentPage, setCurrentPage] = useState(1);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fonction pour fetch et mettre à jour les articles en fonction des filtres
  const fetchPosts = async () => {
    setLoading(true);

    const query = searchParams.get("search") || "";
    const categories = searchParams.get("categories")
      ? searchParams.get("categories")!.split(",")
      : [];
    const authors = searchParams.get("authors")
      ? searchParams.get("authors")!.split(",")
      : [];
    const page = Number(searchParams.get("page")) || 1;

    try {
      const params = new URLSearchParams({
        search: query,
        categories: categories.join(","),
        authors: authors.join(","),
        page: String(page),
        limit: String(postsPerPage),
      });

      const response = await fetch(`/api/blog?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch blogs');
      
      const fetchedPosts = await response.json();

      setPosts(fetchedPosts);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erreur lors du chargement des articles :", err);
    }

    setLoading(false);
  };
  // Fonction pour gérer toutes les mises à jour des filtres
  const handleFiltersUpdate = (filters: {
    search?: string;
    categories?: string[];
    authors?: string[];
  }) => {
    updateUrlParams({ ...filters, page: 1 });
  };
  // Fonction pour gérer la pagination
  const changePage = (page: number) => {
    updateUrlParams({ page });
    scrollTo(0, 800);
  };
  // Mise à jour de l'URL en fonction des filtres
  const updateUrlParams = (filters: {
    search?: string;
    categories?: string[];
    authors?: string[];
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.search !== undefined) {
      filters.search
        ? params.set("search", filters.search)
        : params.delete("search");
    }

    if (filters.categories !== undefined) {
      filters.categories.length > 0
        ? params.set("categories", filters.categories.join(","))
        : params.delete("categories");
    }

    if (filters.authors !== undefined) {
      filters.authors.length > 0
        ? params.set("authors", filters.authors.join(","))
        : params.delete("authors");
    }

    if (filters.page !== undefined) {
      filters.page > 1
        ? params.set("page", String(filters.page))
        : params.delete("page");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Appel des données quand les filtres changent
  useEffect(() => {
    fetchPosts();
  }, [searchParams]);
  // Fetch et Appel du post le plus récent
  const fetchLastPost = async () => {
    try {
      const response = await fetch('/api/blog?action=last');
      if (!response.ok) throw new Error('Failed to fetch last blog');
      
      const fetchedLastPost = await response.json();

      setLastPost(fetchedLastPost);
    } catch (err) {
      console.error("Erreur lors du chargement des articles :", err);
    }
  };
  useEffect(() => {
    fetchLastPost();
  }, []);

  return (
    <>
      {lastPost ? (
        <article className="relative w-full h-[35vh] lg:h-[60vh] rounded-md flex items-end mb-48 lg:mb-36">
          <div className="relative mx-2 md:mx-8 xl:ml-24 bg-slate-50 drop-shadow-xl lg:drop-shadow-2xl z-20 w-full xl:w-[40%] rounded-lg p-4 md:p-8 xl:p-12 translate-y-36 lg:translate-y-16">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-slate-50 bg-blue-700 rounded-[4px] px-2 py-1 text-sm text-nowrap">
                Dernier article
              </span>
              {lastPost.categories &&
                lastPost.categories.map((category: any, index: any) => (
                  <span
                    key={category.title}
                    className="hidden md:block text-slate-50 bg-slate-400 rounded-[4px] px-2 py-1 text-sm">
                    {category.title}
                  </span>
                ))}
            </div>
            <Link href={`/blog/${lastPost.slug.current}`}>
              <h2 className="font-bold text-sm md:text-lg lg:text-xl xl:text-2xl text-slate-900 hover:text-slate-900/75 transition-all">
                {lastPost.title}
              </h2>
            </Link>
            <div className="md:flex items-center gap-4 mt-2 md:mt-8">
              <div className="flex items-center gap-2">
                <Image
                  src={lastPost.author.image.url}
                  alt={
                    `Photo de ${lastPost.author.name} moniteur de parapente à Serre Chevalier` ||
                    "Photo de l'auteur, moniteur de parapente à Serre Chevalier"
                  }
                  width={80}
                  height={80}
                  className="size-8 rounded-full"
                />
                <p>{lastPost.author.name}</p>
              </div>
              <p className="text-slate-900/50">
                le{" "}
                {new Date(lastPost.publishedAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          {lastPost.mainImage && (
            <div className="w-full h-full rounded-md overflow-hidden absolute top-0 left-0">
              <Image
                src={lastPost.mainImage.url}
                alt={lastPost.mainImage.alt || "Blog image"}
                width={1920}
                height={1080}
                className="object-cover w-full h-full"
              />
            </div>
          )}
        </article>
      ) : null}

      <BlogFilters
        searchValue={searchParams.get("search") || ""}
        selectedCategories={searchParams.get("categories")?.split(",") || []}
        selectedAuthors={searchParams.get("authors")?.split(",") || []}
        onFiltersUpdate={handleFiltersUpdate}
      />

      {posts.items.length == 0 ? (
        <div className="bg-slate-50 border border-slate-300 py-12 p-4 rounded-lg flex flex-col items-center gap-2">
          {!loading ? (
            <Frown className="size-10 text-slate-900/50" />
          ) : (
            <LoaderIcon className="size-8 text-slate-900/50 animate-spin" />
          )}
          <p className="text-slate-900 font-bold text-xl mb-4">
            {!loading
              ? "Aucun article ne correspond à votre recherche."
              : "Chargement des articles..."}
          </p>
          <Button
            onClick={() =>
              handleFiltersUpdate({
                search: "",
                categories: [],
                authors: [],
              })
            }>
            Réinitialiser la recherche
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-8 md:space-y-0 md:grid grid-cols-2 2xl:grid-cols-3 gap-8">
            {posts.items.map((post: any) => (
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

          <div className={cn("flex items-center justify-center mt-16 gap-4")}>
            <Button
              onClick={() => changePage(currentPage - 1)}
              variant="outline"
              disabled={currentPage === 1}>
              <LucideChevronLeft className="size-4" />
            </Button>
            {Array.from(
              { length: Math.ceil(posts.total / postsPerPage) },
              (_, index) => (
                <Button
                  key={index + 1}
                  variant="outline"
                  onClick={() => changePage(index + 1)}
                  className={
                    currentPage === index + 1 ? "bg-blue-600 text-white" : ""
                  }>
                  {index + 1}
                </Button>
              )
            )}
            <Button
              onClick={() => changePage(currentPage + 1)}
              variant="outline"
              disabled={posts.total < postsPerPage}>
              <LucideChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default BlogContent;
