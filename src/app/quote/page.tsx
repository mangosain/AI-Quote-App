"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyIcon, Download } from "lucide-react";

export default function QuotePage() {
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [theme, setTheme] = useState("Inspirational");
  const [bgImage, setBgImage] = useState<string | null>(null);

  const quoteRef = useRef<HTMLDivElement | null>(null);
  const API_ENDPOINT = "/api/gemini-quote";

  useEffect(() => {
    fetchBackground(theme);
  }, [theme]);

  async function fetchBackground(theme: string) {
    try {
      const res = await fetch("/api/theme-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      setBgImage(data.imageUrl || null);
    } catch (err) {
      console.error("Error fetching background image:", err);
    }
  }

  async function fetchQuote() {
    setLoading(true);
    setError(false);
    setQuote(null);

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a ${theme.toLowerCase()} quote.`,
        }),
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      setQuote(data.quote || "No quote found.");
    } catch (err) {
      console.error("Error fetching quote:", err);
      setError(true);
    }

    setLoading(false);
  }

  async function downloadQuoteWithBG() {
    if (!quote) return;

    const width = 800;
    const height = 400;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    if (bgImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImage;
      await new Promise<void>((res, rej) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          res();
        };
        img.onerror = () => rej(new Error("Failed to load background image"));
      });
    } else {
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, width, height);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "italic 24px serif";
    wrapText(ctx, quote, width / 2, 100, width - 100, 30);

    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ccc";
    ctx.fillText(`${theme} Quote`, width / 2, height - 30);

    ctx.font = "8px sans-serif";
    ctx.fillStyle = "#aaa";
    ctx.fillText(
      `Generated with ❤️ by Parichay Madnani`,
      width / 2,
      height - 10
    );

    const link = document.createElement("a");
    link.download = `quote-${theme}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line + word + " ";
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxWidth && line) {
        ctx.fillText(line.trim(), x, y);
        line = word + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 gap-6 max-w-2xl mx-auto text-center">
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-semibold"
      >
        AI Generated Quote
      </motion.h1>

      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="px-4 py-2 rounded border max-w-xs text-center hover:bg-yellow-600 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white text-gray-900 shadow-md cursor-pointer"
        aria-label="Select quote theme"
      >
        {["Inspirational", "Love", "Business", "Humour", "Motivational"].map(
          (t) => (
            <option key={t} value={t} className="bg-white text-gray-900">
              {t}
            </option>
          )
        )}
      </select>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="px-5 py-2 bg-red-600 text-white rounded disabled:opacity-50 hover:bg-green-600 transition-colors duration-200 cursor-pointer shadow-md"
        onClick={fetchQuote}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2 cursor-not-allowed">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Quote"
        )}
      </motion.button>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-red-500"
          >
            Failed to fetch quote. Please try again.
          </motion.p>
        )}
      </AnimatePresence>

      {quote && (
        <motion.div
          ref={quoteRef}
          style={{
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundColor: bgImage ? undefined : "#333",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
            minHeight: "200px",
          }}
          className="shadow-lg p-6 rounded-xl border max-w-xl w-full flex items-center justify-center"
          key="quote-box"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="italic text-lg bg-black/50 p-4 rounded">{quote}</p>
        </motion.div>
      )}

      {quote && (
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => quote && navigator.clipboard.writeText(quote)}
            className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 hover:text-yellow-900 hover:scale-105 transition transform duration-200 flex items-center gap-2 shadow-md cursor-pointer"
          >
            <CopyIcon />
            Copy to Clipboard
          </button>
          <button
            onClick={downloadQuoteWithBG}
            className="px-4 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 hover:text-yellow-900 hover:scale-105 transition transform duration-200 flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Download /> Download Quote as Image
          </button>
        </div>
      )}

      <footer className="w-full h-fit p-1 bg-yellow-100 text-yellow-700 absolute bottom-0 text-center text-sm">
        <p>Made with ❤️ by Parichay Madnani</p>
      </footer>
    </main>
  );
}
