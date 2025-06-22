'use client'

import html2canvas from 'html2canvas'
import { useState, useRef,useEffect} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuotePage() {
  const [quote, setQuote] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [theme, setTheme] = useState('Inspirational')
  const [bgImage, setBgImage] = useState<string | null>(null)

  const quoteRef = useRef<HTMLDivElement | null>(null)
  const API_ENDPOINT = '/api/gemini-quote'
  
  useEffect(() => {
  fetchBackground(theme)
}, [theme])

  async function fetchBackground(theme: string) {
  try {
    console.log("fetch background called for theme:", theme)
    const res = await fetch('/api/theme-image', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ theme }),
});


    const data = await res.json()
    console.log("data", data)

setBgImage(data.imageUrl || null)
  } catch (err) {
    console.error('Error fetching background image:', err)
  }
}

  async function fetchQuote() {
    setLoading(true)
    setError(false)
    setQuote(null)

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Generate a ${theme.toLowerCase()} quote.` }),
      })
      if (!response.ok) throw new Error('Network response was not ok')

      const data = await response.json()
      setQuote(data.quote || 'No quote found.')
    } catch (err) {
      console.error('Error fetching quote:', err)
      setError(true)
    }

    setLoading(false)
  }

  async function downloadImage() {
    if (!quoteRef.current) return

    const canvas = await html2canvas(quoteRef.current, { scale: 2 })
    const link = document.createElement('a')
    link.download = 'quote.png'
    link.href = canvas.toDataURL()
    link.click()
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

      {/* Theme selector */}
      <select
        value={theme}
        onChange={(e) => {
          setTheme(e.target.value) 
          //fetchBackground(theme);
        }}
        className="px-4 py-2 rounded border max-w-xs text-center hover:bg-yellow-600"
        aria-label="Select quote theme"
      >
        <option value="Inspirational" className="bg-white text-gray-900" >Inspirational</option>
        <option value="Love" className="bg-white text-gray-900">Love</option>
        <option value="Business" className="bg-white text-gray-900">Business</option>
        <option value="Humour" className="bg-white text-gray-900">Humor</option>
        <option value="Motivational" className="bg-white text-gray-900">Motivational</option>
      </select>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05, backgroundColor: 'green' }}
        className="px-5 py-2 bg-red-600 text-white rounded  disabled:opacity-50"
        onClick={fetchQuote}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
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
          'Generate Quote'
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
      backgroundColor: bgImage ? undefined : '#333', // fallback dark bg
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    minHeight: '200px',
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
          <motion.button
            onClick={() => quote && navigator.clipboard.writeText(quote)}
            className="px-4 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 hover:text-yellow-900 hover:scale-105 transition transform duration-200"
          >
            📋 Copy to Clipboard
          </motion.button>

          <motion.button
            onClick={downloadImage}
            className="px-4 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 hover:text-yellow-900 hover:scale-105 transition transform duration-200"
          >
            ⬇️ Download Quote as Image
          </motion.button>
        </div>
      )}
    </main>
  )
}
