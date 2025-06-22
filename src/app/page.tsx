'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Welcome to AI Quote Generator</h1>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => router.push('/quote')}
      >
        Generate AI Quote
      </button>
    </main>
  )
}
