import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/auth.config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fileId, newName } = await req.json();

    const drive = google.drive({ version: "v3", auth: session.accessToken });

    // Copy file to user's app-accessible Drive folder
    const response = await drive.files.copy({
      fileId,
      requestBody: { name: newName || "CopiedFile" },
      fields: "id, name, mimeType",
    });

    return NextResponse.json({ file: response.data });
  } catch (error) {
    console.error("Drive copy error:", error);
    return NextResponse.json({ error: "Failed to copy file" }, { status: 500 });
  }
}
