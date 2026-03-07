import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

const LANG_CONFIG: Record<string, { instruction: string }> = {
  EN:  { instruction: 'Respond in English.' },
  FIL: { instruction: 'Respond in Filipino (Tagalog). Mix English technical terms naturally as Filipinos commonly do.' },
  ZH:  { instruction: 'Respond in Simplified Chinese (简体中文). Be clear and professional.' },
  ES:  { instruction: 'Respond in Spanish (Español). Be friendly and professional.' },
  AR:  { instruction: 'Respond in Arabic (العربية). Be respectful and professional. Use right-to-left conventions in your phrasing.' },
  HI:  { instruction: 'Respond in Hindi (हिन्दी). Mix English technical terms naturally as Indian tech users commonly do.' },
  FR:  { instruction: 'Respond in French (Français). Be polite and professional.' },
  BN:  { instruction: 'Respond in Bengali (বাংলা). Be friendly and clear.' },
  RU:  { instruction: 'Respond in Russian (Русский). Be professional and direct.' },
  PT:  { instruction: 'Respond in Portuguese (Português). Be friendly and professional.' },
  ID:  { instruction: 'Respond in Indonesian (Bahasa Indonesia). Be friendly and professional.' },
  DE:  { instruction: 'Respond in German (Deutsch). Be precise and professional.' },
  JA:  { instruction: 'Respond in Japanese (日本語). Be polite and professional. Use appropriate keigo (敬語) when addressing the user.' },
  KO:  { instruction: 'Respond in Korean (한국어). Be polite and professional.' },
  VI:  { instruction: 'Respond in Vietnamese (Tiếng Việt). Be friendly and professional.' },
  TR:  { instruction: 'Respond in Turkish (Türkçe). Be friendly and professional.' },
  IT:  { instruction: 'Respond in Italian (Italiano). Be warm and professional.' },
  TH:  { instruction: 'Respond in Thai (ภาษาไทย). Be polite and professional.' },
  NL:  { instruction: 'Respond in Dutch (Nederlands). Be direct and professional.' },
  PL:  { instruction: 'Respond in Polish (Polski). Be professional and helpful.' },
}

function buildSystemPrompt(lang: string): string {
  const cfg = LANG_CONFIG[lang] ?? LANG_CONFIG['EN']
  const { instruction } = cfg

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

REALISTIC PRICING GUIDELINES (Philippine Pesos — ₱):
IMPORTANT: All prices are in Philippine Pesos (₱). Pricing is ALWAYS dependent on the complexity of the project, the number of features required, integrations needed, scope of work, and timeline. NEVER quote a single fixed price — always give a realistic range and emphasize that the final cost is determined after a free discovery call where we assess the full scope.

Website Development:
- Simple landing page / portfolio: ₱15,000 – ₱40,000
- Corporate website with CMS: ₱50,000 – ₱150,000
- Web app / SaaS / e-commerce platform: ₱200,000 – ₱800,000+

Custom Software Development:
- Simple internal tool / admin system: ₱50,000 – ₱120,000
- Mid-complexity system (inventory, HR, POS): ₱150,000 – ₱500,000
- Full enterprise platform / ERP: ₱500,000 – ₱2,000,000+

Mobile App Development:
- Simple cross-platform app (Android + iOS): ₱80,000 – ₱200,000
- App with backend, auth, real-time features: ₱250,000 – ₱700,000
- Complex app (AI, IoT, marketplace): ₱500,000 – ₱1,500,000+

Academic / Capstone Systems:
- Basic CRUD / thesis system: ₱8,000 – ₱25,000
- Full system with dashboard, reports, roles: ₱25,000 – ₱80,000

Ready-Made Systems (pre-built, configurable):
- POS / Inventory / Attendance: ₱5,000 – ₱35,000
- HR / Payroll / School Management: ₱15,000 – ₱60,000

IT Consulting / Integration:
- Hourly consultation: ₱1,500 – ₱5,000/hr
- Project-based: depends on scope

UI/UX Design:
- Wireframes & prototyping: ₱15,000 – ₱40,000
- Full design system & handoff: ₱60,000 – ₱200,000+

Cybersecurity & Data Protection:
- Vulnerability assessment: ₱30,000 – ₱80,000
- Full penetration test & compliance: ₱120,000 – ₱350,000+

Business Automation:
- Single workflow automation: ₱25,000 – ₱70,000
- Multi-department suite: ₱120,000 – ₱500,000+

Deployment & Hosting / DevOps:
- Cloud setup + CI/CD: ₱20,000 – ₱60,000
- Full Kubernetes deployment: ₱80,000 – ₱250,000+

RULES for pricing:
- Always present a range, never a single price
- Always say final cost depends on the complexity, number of features, scope, required integrations, and timeline of the project
- If user describes their project, tailor the estimate to their scope
- Emphasize that exact quotes are only provided after a free discovery call
- All prices are in Philippine Pesos (₱) — do NOT convert to other currencies

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
