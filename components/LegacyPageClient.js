"use client";

import { useEffect, useRef } from "react";

async function exposeBrowserLibraries({ exposePdfLib, exposeCanvasPdf }) {
  if (exposePdfLib) {
    const pdfLib = await import("pdf-lib");
    window.PDFLib = pdfLib;
  }

  if (exposeCanvasPdf) {
    const [{ default: html2canvas }, jspdfModule] = await Promise.all([
      import("html2canvas"),
      import("jspdf")
    ]);

    window.html2canvas = html2canvas;
    window.jspdf = jspdfModule;
  }
}

export default function LegacyPageClient({ page, exposePdfLib = false, exposeCanvasPdf = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    document.body.className = page.bodyClassName || "";
    return () => {
      document.body.className = "";
    };
  }, [page.bodyClassName]);

  useEffect(() => {
    let cancelled = false;

    async function runPageScripts() {
      await exposeBrowserLibraries({ exposePdfLib, exposeCanvasPdf });
      if (cancelled) return;

      for (const script of page.scripts) {
        if (cancelled) return;
        const scriptElement = document.createElement("script");
        scriptElement.textContent = script;
        document.body.appendChild(scriptElement);
      }
    }

    runPageScripts().catch((error) => {
      console.error("Failed to initialize legacy page script", error);
    });

    return () => {
      cancelled = true;
    };
  }, [page.scripts, exposePdfLib, exposeCanvasPdf]);

  return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: page.bodyHtml }} />;
}
