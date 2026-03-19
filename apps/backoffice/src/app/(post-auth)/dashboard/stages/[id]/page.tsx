import StageDetails from "@/app/(post-auth)/dashboard/stages/[id]/content";
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  if (!id) {
    return <div>Stage ID is required</div>;
  }
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-16">
      <StageDetails id={id} />
    </main>
  );
}