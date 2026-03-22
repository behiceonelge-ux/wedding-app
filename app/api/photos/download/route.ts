import { NextRequest, NextResponse } from "next/server";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const storagePath = request.nextUrl.searchParams.get("path");

  if (!storagePath) {
    return NextResponse.json({ error: "Missing storage path" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage.from(getStorageBucket()).download(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileName = storagePath.split("/").pop() || "photo";

  return new NextResponse(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
