import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * POST /api/upload — issues short-lived client upload tokens for Vercel Blob.
 * The browser uploads the file bytes directly to Blob storage (not through this function),
 * so large videos don't hit serverless request-body size limits. This route only authorizes.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");
        return {
          // Photos only for now — video support is scaffolded (UploadedMedia.type, ReviewMedia.type,
          // PlaceSubmission.videoUrls) but disabled at the upload boundary until re-enabled.
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          addRandomSuffix: true,
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
