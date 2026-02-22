import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const SYSTEM_PROMPT = `You are PROGREX AI, a friendly and professional assistant for PROGREX — a cutting-edge technology solutions company. 

PROGREX specializes in:
- Custom Software Development (tailored enterprise solutions, ERP, automation tools)
- Web Development (Next.js, React, high-performance web apps and SaaS platforms)
- Mobile App Development (React Native, Flutter, iOS and Android apps)
- System Integration (API development, third-party integrations, middleware)
- IT Consulting (digital transformation, tech strategy, architecture planning)
- Cloud & DevOps (AWS, Azure, Docker, Kubernetes, CI/CD pipelines)
- UI/UX Design (user-centered design, prototyping, design systems)
- Ready-Made Systems (pre-built business systems available for quick deployment)

Your role:
- Answer questions about PROGREX's services, process, pricing ballparks, and capabilities
- Help potential clients understand how PROGREX can solve their business problems
- Guide users to the right service or contact page when appropriate
- Be concise, professional, and helpful
- If asked about pricing, give honest ranges (custom software: $10k–$100k+, websites: $3k–$30k+, mobile apps: $5k–$50k+) and note that exact quotes come after a discovery call
- For complex inquiries, encourage users to reach out via the Contact Us page or schedule a consultation
- Always represent PROGREX positively and professionally

Do not:
- Make up specific staff names or guaranteed timelines without caveats
- Share confidential or non-public information
- Go off-topic — keep conversations relevant to tech, software, and PROGREX's offerings

Keep responses concise — 2–4 sentences usually suffices unless a detailed explanation is genuinely needed.`

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured. Please add it to your .env.local file.' },
        { status: 500 }
      )
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Groq API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch response from Groq API.', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.'

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat API route error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
