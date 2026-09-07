// Client-side image resizer: turns a single uploaded file into 3 WebP variants
// (thumb / card / full) so the site can serve a light image in cards and a
// larger one in the modal without forcing the user to prepare multiple files.

export type ResizedBlobs = {
  thumb: Blob;
  card: Blob;
  full: Blob;
};

const TARGETS = {
  thumb: 200,
  card: 600,
  full: 1600,
} as const;

const QUALITY = 0.82;

async function loadBitmap(file: Blob): Promise<{
  width: number;
  height: number;
  draw: (canvas: HTMLCanvasElement | OffscreenCanvas) => void;
  close: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    const bmp = await createImageBitmap(file);
    return {
      width: bmp.width,
      height: bmp.height,
      draw: (canvas) => {
        const ctx = (canvas as HTMLCanvasElement).getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(bmp as unknown as CanvasImageSource, 0, 0, canvas.width, canvas.height);
      },
      close: () => bmp.close(),
    };
  }
  // Fallback: <img>
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    draw: (canvas) => {
      const ctx = (canvas as HTMLCanvasElement).getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    },
    close: () => URL.revokeObjectURL(url),
  };
}

async function canvasToWebP(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  quality: number,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/webp", quality });
  }
  return new Promise<Blob>((resolve, reject) => {
    (canvas as HTMLCanvasElement).toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/webp",
      quality,
    );
  });
}

async function resizeTo(
  source: { width: number; height: number; draw: (c: HTMLCanvasElement | OffscreenCanvas) => void },
  maxEdge: number,
): Promise<Blob> {
  const ratio = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const w = Math.max(1, Math.round(source.width * ratio));
  const h = Math.max(1, Math.round(source.height * ratio));

  let canvas: HTMLCanvasElement | OffscreenCanvas;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(w, h);
  } else {
    canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
  }
  source.draw(canvas);
  return canvasToWebP(canvas, QUALITY);
}

export async function resizeToVariants(file: File): Promise<ResizedBlobs> {
  const src = await loadBitmap(file);
  try {
    const [thumb, card, full] = await Promise.all([
      resizeTo(src, TARGETS.thumb),
      resizeTo(src, TARGETS.card),
      resizeTo(src, TARGETS.full),
    ]);
    return { thumb, card, full };
  } finally {
    src.close();
  }
}

// Reprocess an already-uploaded image URL into the 3 variants.
export async function resizeUrlToVariants(url: string): Promise<ResizedBlobs> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${url} failed`);
  const blob = await resp.blob();
  // Wrap in a File-like for createImageBitmap (it accepts Blob too).
  return resizeToVariants(new File([blob], "source", { type: blob.type }));
}
