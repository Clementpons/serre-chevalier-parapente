import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/content/topbar`,
      {
        next: { revalidate: 60 },
      },
    );
    const json = await res.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error("Error fetching topbar proxy:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching TopBar" },
      { status: 500 },
    );
  }
}
