/**
 * Client-side PDF parsing via pdfjs-dist.
 *
 * Runs in the browser only. The worker is loaded from a CDN so we don't
 * need a custom webpack config or postinstall step. If the CDN is
 * unreachable, the UI surfaces an error and offers a textarea fallback.
 */

const CDN_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

let workerInitialized = false;

async function ensureWorker() {
  if (workerInitialized) return;
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = CDN_WORKER_URL;
  workerInitialized = true;
}

export async function parsePdfToText(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("parsePdfToText runs in the browser only.");
  }
  await ensureWorker();
  const pdfjs = await import("pdfjs-dist");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
