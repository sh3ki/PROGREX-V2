import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const LANG_CONFIG: Record<string, { currency: string; symbol: string; instruction: string }> = {
  EN:  { currency: 'USD', symbol: '$',   instruction: 'Respond in English.' },
  FIL: { currency: 'PHP', symbol: '₱',   instruction: 'Respond in Filipino (Tagalog). Mix English technical terms naturally as Filipinos commonly do.' },
  ZH:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Simplified Chinese (简体中文). Be clear and professional.' },
  ES:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Spanish (Español). Be friendly and professional.' },
  AR:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Arabic (العربية). Be respectful and professional. Use right-to-left conventions in your phrasing.' },
  HI:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Hindi (हिन्दी). Mix English technical terms naturally as Indian tech users commonly do.' },
  FR:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in French (Français). Be polite and professional.' },
  BN:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Bengali (বাংলা). Be friendly and clear.' },
  RU:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Russian (Русский). Be professional and direct.' },
  PT:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Portuguese (Português). Be friendly and professional.' },
  ID:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Indonesian (Bahasa Indonesia). Be friendly and professional.' },
  DE:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in German (Deutsch). Be precise and professional.' },
  JA:  { currency: 'JPY', symbol: '¥',   instruction: 'Respond in Japanese (日本語). Be polite and professional. Use appropriate keigo (敬語) when addressing the user.' },
  KO:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Korean (한국어). Be polite and professional.' },
  VI:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Vietnamese (Tiếng Việt). Be friendly and professional.' },
  TR:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Turkish (Türkçe). Be friendly and professional.' },
  IT:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Italian (Italiano). Be warm and professional.' },
  TH:  { currency: 'USD', symbol: '$',   instruction: 'Respond in Thai (ภาษาไทย). Be polite and professional.' },
  NL:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Dutch (Nederlands). Be direct and professional.' },
  PL:  { currency: 'EUR', symbol: '€',   instruction: 'Respond in Polish (Polski). Be professional and helpful.' },
}

function fmt(php: number, currency: string, symbol: string): string {
  let val: number
  if (currency === 'PHP') val = php
  else if (currency === 'USD') val = Math.round(php / 56 / 100) * 100
  else if (currency === 'JPY') val = Math.round((php * 2.4) / 1000) * 1000
  else val = Math.round(php / 61 / 100) * 100 // EUR
  return symbol + val.toLocaleString()
}

function buildSystemPrompt(lang: string): string {
  const cfg = LANG_CONFIG[lang] ?? LANG_CONFIG['EN']
  const { symbol, currency, instruction } = cfg
  const f = (php: number) => fmt(php, currency, symbol)

  return `You are PROGREX AI, a friendly and professional assistant for PROGREX — a technology solutions company based in Calauan, Laguna, Philippines.

LANGUAGE: ${instruction} Always respond in this language for the entire conversation.

PROGREX specializes in:
- Custom Software Development (tailored enterprise solutions, ERP, automation tools)
- Web Development (Next.js, React, high-performance web apps and SaaS platforms)
- Mobile App Development (React Native, Flutter, iOS and Android apps)
- System Integration (API development, third-party integrations, middleware)
- IT Consulting (digital transformation, tech strategy, architecture planning)
- Cloud & DevOps (AWS, Azure, Docker, Kubernetes, CI/CD pipelines)
- UI/UX Design (user-centered design, prototyping, design systems)
- Ready-Made Systems (pre-built business systems available for quick deployment)
- Academic / Capstone Systems (thesis and capstone projects for students)

REALISTIC PRICING GUIDELINES (currency: ${currency}):
Pricing is ALWAYS dependent on project complexity, number of features, required integrations, and functionality. Never quote a single fixed price — always give a range and explain that the final cost is determined after a free discovery call.

Website Development:
- Simple landing page / portfolio: ${f(15000)} – ${f(40000)}
- Corporate website with CMS: ${f(50000)} – ${f(150000)}
- Web app / SaaS / e-commerce platform: ${f(200000)} – ${f(800000)}+

Custom Software Development:
- Simple internal tool / admin system: ${f(50000)} – ${f(120000)}
- Mid-complexity system (inventory, HR, POS): ${f(150000)} – ${f(500000)}
- Full enterprise platform / ERP: ${f(500000)} – ${f(2000000)}+

Mobile App Development:
- Simple cross-platform app (Android + iOS): ${f(80000)} – ${f(200000)}
- App with backend, auth, real-time features: ${f(250000)} – ${f(700000)}
- Complex app (AI, IoT, marketplace): ${f(500000)} – ${f(1500000)}+

Academic / Capstone Systems:
- Basic CRUD / thesis system: ${f(8000)} – ${f(25000)}
- Full system with dashboard, reports, roles: ${f(25000)} – ${f(80000)}

Ready-Made Systems (pre-built, configurable):
- POS / Inventory / Attendance: ${f(5000)} – ${f(35000)}
- HR / Payroll / School Management: ${f(15000)} – ${f(60000)}

IT Consulting / Integration:
- Hourly consultation: ${f(1500)} – ${f(5000)}/hr
- Project-based: depends on scope

RULES for pricing:
- Always present a range, never a single price
- Always say final cost depends on complexity, features, and functionality
- If user describes their project, tailor the estimate to their scope
- Exact quotes only after a free discovery call

Do not:
- Make up staff names or guaranteed timelines
- Share confidential information
- Go off-topic from tech, software, and PROGREX offerings

Keep responses concise — 2–4 sentences unless detail is genuinely needed.`
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, lang = 'EN' }: { messages: ChatMessage[]; lang?: string } = await req.json()

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
          { role: 'system', content: buildSystemPrompt(lang) },
          ...messages,
        ],
        max_tokens: 700,
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
