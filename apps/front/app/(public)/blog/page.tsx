import { Suspense } from "react";
import ContactSection from "@/components/sections/ContactSection";
import BlogContent from "./blog-content";
import { LoaderIcon } from "lucide-react";

export async function generateMetadata() {
  return {
    title: `Blog Parapente en France | Stages, Tarifs et Conseils`,
    description: `Découvrez nos articles sur le Parapente : Tarifs, Conseils et Sécurité. Explorez le vol en plein air avec Serre Chevalier Parapente, équipe certifiée FFVL.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/blog`,
    },
  };
}

const BlogPage = () => {
  return (
    <>
      <div className="pt-36">
        <div className="mx-4 md:mx-24 xl:mx-64">
          <h1 className="text-slate-900 font-bold text-4xl md:text-5xl text-center mb-16">
            Serre-Chevalier Parapente - Blog
          </h1>
          <Suspense fallback={
            <div className="flex justify-center items-center py-12">
              <LoaderIcon className="size-8 text-slate-900/50 animate-spin" />
            </div>
          }>
            <BlogContent />
          </Suspense>
        </div>
        <ContactSection />
      </div>
    </>
  );
};

export default BlogPage;
