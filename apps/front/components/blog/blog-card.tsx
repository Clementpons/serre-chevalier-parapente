import { TagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BlogCard = ({
  title,
  slug,
  mainImage,
  author,
  categories,
  publishedAt,
}: {
  title: string;
  slug: string;
  mainImage: { url: string; alt?: string } | null;
  author: { name: string; image: { url: string } };
  categories: { title: string }[] | null;
  publishedAt: string;
}) => {
  return (
    <article className="w-full self-stretch p-[24px] border border-slate-300 rounded-[16px]">
      {mainImage && (
        <div className="w-full h-[30svh] rounded-[8px] overflow-hidden">
          <Image
            src={mainImage.url}
            alt={mainImage.alt || "Blog image"}
            width={1920}
            height={1080}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mt-8 mb-4">
        {categories &&
          categories.map((category) => (
            <span
              key={category.title}
              className="text-white bg-blue-600 rounded-[4px] px-2 py-1 text-sm flex items-center gap-1">
              <TagIcon className="size-3" />
              {category.title}
            </span>
          ))}
      </div>
      <Link href={`/blog/${slug}`}>
        <h2 className="font-bold text-md text-slate-900 hover:text-slate-900/75 transition-all">
          {title}
        </h2>
      </Link>
      <div className="flex md:block md:space-y-2 items-center gap-4 mt-8">
        <div className="flex items-center gap-2">
          <Image
            src={author.image.url}
            alt={
              `Photo de ${author.name}, moniteur de parapente à Serre Chevalier Briançon` ||
              "Photo de l'auteur de l'article, moniteur de parapente à Serre Chevalier Briançon"
            }
            width={80}
            height={80}
            className="size-8 rounded-full"
          />
          <p className="text-sm">{author.name}</p>
        </div>
        <p className="text-slate-900/50 text-sm">
          Publié le{" "}
          {new Date(publishedAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </article>
  );
};

export default BlogCard;
