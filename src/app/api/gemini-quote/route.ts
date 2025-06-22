import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not set' }, { status: 500 });
    }

    // Parse JSON body to get the prompt
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt, // Use dynamic prompt here
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.9,
          topP: 1,
          topK: 1,
        },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error('Gemini API Error Response:', errorBody);
      return NextResponse.json({ error: errorBody.error?.message || 'Unknown error' }, { status: res.status });
    }

    const data = await res.json();
    const generatedQuote = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No quote returned';

    return NextResponse.json({ quote: generatedQuote });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}
