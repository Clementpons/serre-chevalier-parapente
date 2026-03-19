import { AppSidebar } from "@/components/sidebar/user/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";

export default async function DashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrent();
  if (!user) {
    redirect("/sign-in");
  }
  if (user?.role === "CUSTOMER") {
    redirect("/account");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <DashboardHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
