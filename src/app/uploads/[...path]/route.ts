import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { Readable } from "node:stream";

export const dynamic = "force-dynamic";

type UploadRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mov": "video/quicktime",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".webm": "video/webm",
  ".webp": "image/webp",
};

function getUploadFilePath(pathParts: string[]) {
  const uploadRoot = join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads");
  const filePath = normalize(join(uploadRoot, ...pathParts));

  if (filePath !== uploadRoot && filePath.startsWith(`${uploadRoot}${sep}`)) {
    return filePath;
  }

  return null;
}

function getContentType(filePath: string) {
  return mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
}

function createHeaders(filePath: string, size: number, extraHeaders?: HeadersInit) {
  return new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Length": String(size),
    "Content-Type": getContentType(filePath),
    ...extraHeaders,
  });
}

async function serveUpload(request: Request, context: UploadRouteContext, includeBody: boolean) {
  const { path = [] } = await context.params;
  const filePath = getUploadFilePath(path);

  if (!filePath) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const range = request.headers.get("range");

    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);

      if (match) {
        const start = match[1] ? Number(match[1]) : 0;
        const end = match[2] ? Math.min(Number(match[2]), fileStat.size - 1) : fileStat.size - 1;

        if (Number.isFinite(start) && Number.isFinite(end) && start <= end) {
          const stream = includeBody
            ? (Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream)
            : null;

          return new Response(stream, {
            status: 206,
            headers: createHeaders(filePath, end - start + 1, {
              "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
            }),
          });
        }
      }
    }

    const stream = includeBody
      ? (Readable.toWeb(createReadStream(filePath)) as ReadableStream)
      : null;

    return new Response(stream, {
      headers: createHeaders(filePath, fileStat.size),
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function GET(request: Request, context: UploadRouteContext) {
  return serveUpload(request, context, true);
}

export async function HEAD(request: Request, context: UploadRouteContext) {
  return serveUpload(request, context, false);
}
