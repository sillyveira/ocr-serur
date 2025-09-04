"use client";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

async function loadPdfJs() {
  if (typeof window !== 'undefined' && !window.pdfjsLib) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      // Use local files first
      script.src = '/pdf.min.js';
      
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
      
      script.onerror = () => {
        // Fallback to CDN if local files fail
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        fallbackScript.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(window.pdfjsLib);
        };
        fallbackScript.onerror = reject;
        document.head.appendChild(fallbackScript);
      };
      
      document.head.appendChild(script);
    });
  }
  return window.pdfjsLib;
}

export async function pdfToImage(file: File): Promise<File[]> {
  try {
    const pdfjsLib = await loadPdfJs();

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const images: File[] = [];

    for (let pdfPage = 1; pdfPage <= pdf.numPages; pdfPage++) {
      const page = await pdf.getPage(pdfPage);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob(resolve as BlobCallback, "image/png");
      });

      const imageFile = new File(
        [blob],
        `${file.name.split(".")[0]}_page_${pdfPage}.png`,
        {
          type: "image/png",
        }
      );

      images.push(imageFile);
    }

    return images;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error('Failed to process PDF file');
  }
}
