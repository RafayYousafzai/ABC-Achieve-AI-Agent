import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const sessionId = String(formData.get("sessionId") || "anonymous");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `${sessionId}/${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error } = await supabase.storage
      .from("insurance-cards")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("insurance-cards").getPublicUrl(filePath);

    return Response.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload API Crash:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}