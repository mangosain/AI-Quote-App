import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { theme } = await req.json()
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY

  if (!PEXELS_API_KEY) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
  }
  console.log("themebackend"+theme)

  const res = await fetch(`https://api.pexels.com/v1/search?query=${theme}&per_page=1`, {
    headers: {
      Authorization:PEXELS_API_KEY,
    },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }

  const data = await res.json();
  console.log(data);
  const imageUrl = data.photos?.[0]?.src?.large || null
  console.log(imageUrl)
  return NextResponse.json({ imageUrl })
}
