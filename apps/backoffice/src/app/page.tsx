import { getCurrent } from "@/features/auth/actions";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Stage de Parapente - BackOffice | Bienvenue !",
  description: "",
};

export default async function DashboardAdminPage() {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }
  if (user?.role === "ADMIN" || user?.role === "MONITEUR") {
    redirect("/dashboard");
  } else {
    redirect("/account");
  }

  // return (
  //   <main className="flex flex-col items-center justify-center h-screen w-screen">
  //     <p>Hello {user.name}</p>
  //     <p>{user.email}</p>
  //     <Avatar>
  //       <AvatarImage src={user.avatarUrl} alt={user.name} />
  //       <AvatarFallback>
  //         {user.name[0]}
  //         {user.name[1]}
  //       </AvatarFallback>
  //     </Avatar>
  //     <LogoutButton />
  //   </main>
  // );
}
