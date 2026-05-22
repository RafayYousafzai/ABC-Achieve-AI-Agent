import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { fileName, fileType, sessionId = "anonymous" } = await req.json();

    if (!fileName) {
      return new Response(JSON.stringify({ error: "Missing fileName" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileExt = fileName.split(".").pop() || "png";
    const fileNameOnStorage = `${sessionId}/${Date.now()}.${fileExt}`;
    const filePath = `public/${fileNameOnStorage}`;

    const { data, error } = await supabase.storage
      .from("insurance-cards")
      .createSignedUploadUrl(filePath);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("insurance-cards").getPublicUrl(filePath);

    return Response.json({
      signedUrl: data.signedUrl,
      publicUrl,
    });
  } catch (error) {
    console.error("Upload API Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}