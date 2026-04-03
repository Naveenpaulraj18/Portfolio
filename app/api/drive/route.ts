import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/auth.config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      pageSize: 10,
      fields: "files(id, name, mimeType)",
    });

    return Response.json(response.data.files);
  } catch (error) {
    console.error("Drive API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch files" }),
      { status: 500 }
    );
  }
}
