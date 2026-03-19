// app/blog/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBlog, getBlogs } from "@/sanity/lib/blogs";
import Image from "next/image";
import { PortableText } from "next-sanity";
import ImageComponent from "@/components/blog/ImageComponent";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BlogRelativeArticles from "@/components/blog/blog-relative-article";

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Fonction de génération des métadonnées pour SEO (facultatif)
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = await getBlog(params.slug);

  if (!post) {
    return {
      title: "Post non trouvé",
      alternates: {
        canonical: `https://www.serre-chevalier-parapente.fr/`,
      },
    };
  }

  return {
    title: `Stage de parapente - ${post.metaTitle || ""}`,
    description: post.metaDesc || "",
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/blog/${params.slug}`,
    },
  };
}

// Page du post
const PostPage = async ({ params }: PostPageProps) => {
  const post = await getBlog(params.slug);

  // Si le post n'existe pas, on retourne une page 404
  if (!post) {
    notFound();
  }

  return (
    <>
      <div className="pt-48">
        <div className="mx-4 md:mx-48 lg:mx-72">
          <Breadcrumb className="mb-8 lg:mb-16">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/blog">Blog</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <p className="">
              Publié le :{" "}
              {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <span> | </span>
            <div className="flex items-center gap-2">
              Par :{" "}
              <div className="flex items-center gap-2">
                <Image
                  src={post.author.image.url}
                  alt={
                    `Photo de ${post.author.name}, moniteur de parapente à Serre Chevalier` ||
                    "Photo de l'auteur, moniteur de parapente à Serre Chevalier"
                  }
                  width={80}
                  height={80}
                  className="size-8 rounded-full"
                />
                <Link
                  href={`/blog?authors=${post.author.name.replace(/ /g, "+")}`}
                  className="hover:underline cursor-pointer"
                >
                  {post.author.name}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center mt-2 mb-8 lg:mb-16 gap-4">
            {post.categories &&
              post.categories.map((category: any, index: any) => (
                <Link
                  href={`/blog?categories=${category.title}`}
                  key={category.title}
                  className="text-slate-50 bg-blue-600 hover:bg-blue-500 transition cursor-pointer rounded-[4px] px-2 py-1 text-sm flex items-center gap-1"
                >
                  <Tag className="size-3" />
                  {category.title}
                </Link>
              ))}
          </div>
          <h1 className="text-slate-900 font-bold text-4xl mb-8 lg:mb-16 xl:w-2/3">
            {post.title}
          </h1>
          {post.mainImage && (
            <div className="rounded-lg overflow-hidden h-[35svh] lg:h-[60svh]">
              <Image
                src={post.mainImage.url}
                alt={post.mainImage.alt || "Title image"}
                width={1920}
                height={1080}
                priority
                className="object-center object-cover w-full h-full"
              />
            </div>
          )}
          <div className="my-16 lg:my-32 prose prose-blue prose-lg prose-a:text-blue-800 max-w-none w-full">
            <PortableText
              value={post.body}

              components={{
                types: {
                  image: ImageComponent,
                },
              }}
            />
          </div>

          {post.CtaLink && post.CtaText && post.CtaButtonText && (
            <section
              className="mx-4 my-12 lg:mx-24 xl:mx-16 lg:my-48"
              id="contact"
            >
              <Image
                src="/logo/logo-dark-nobg.webp"
                alt="serreche-parapente-team"
                width={214}
                height={214}
                className="block w-24 h-24 mx-auto"
              />
              <p className="font-bold text-2xl text-slate-900 text-center mt-8">
                {post.CtaText}
              </p>
              <div className="md:flex md:items-center md:gap-8 mt-8 md:justify-center space-y-4 md:space-y-0">
                <Link
                  href={post.CtaLink}
                  title="Je réserve ma place"
                  className="block"
                >
                  <Button
                    variant={"default"}
                    size={"lg"}
                    className="w-full lg:w-auto"
                  >
                    {post.CtaButtonText}
                  </Button>
                </Link>
                <Link
                  href={"mailto:clementpons5@gmail.com"}
                  title="Contacter Serre Chevalier Parapente"
                  className="block"
                >
                  <Button
                    variant={"outline"}
                    size={"lg"}
                    className="w-full lg:w-auto"
                  >
                    J&apos;ai une question
                  </Button>
                </Link>
              </div>
            </section>
          )}

          <div className="mb-24 xl:mb-16">
            <p className="mb-8 font-bold text-2xl relative before:content-[''] before:block before:w-1 pl-4 before:h-full before:bg-blue-600 before:absolute before:left-0 before:top-0">
              Nos derniers articles
            </p>
            <BlogRelativeArticles slugToExclude={params.slug} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPage;

// Configuration ISR pour la revalidation
export const revalidate = 21600; // Revalidation toutes les 24 heures
