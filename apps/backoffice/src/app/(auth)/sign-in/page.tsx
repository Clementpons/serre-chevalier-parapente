import { getCurrent } from "@/features/auth/actions";
import { LoginForm } from "@/features/auth/components/sign-in-form";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Login",
  description: "",
};

export default async function Page() {
  const user = await getCurrent();
  if (user) {
    redirect("/");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link
            href="/"
            title="Serre Chevalier Parapente"
            className="flex items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center bg-slate-900 dark:bg-white p-1 rounded-full">
              <Image
                src={"/logo-light-nobg.webp"}
                alt="Logo Serre Chevalier Parapente"
                className="dark:invert"
                width={48}
                height={48}
              />
            </div>
            Serre Chevalier Parapente
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block m-4 rounded-2xl overflow-hidden">
        <Image
          src="/placeholder-auth.webp"
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
