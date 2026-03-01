'use client'

import { useRef } from 'react'

// ── Data ──────────────────────────────────────────────────────────────────────
const d = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons'

const CATEGORIES = [
  {
    id: 'languages',
    label: 'Programming Languages',
    accent: '#F97316',
    speed: 40,
    reverse: false,
    items: [
      { name: 'Python',     icon: `${d}/python/python-original.svg` },
      { name: 'JavaScript', icon: `${d}/javascript/javascript-original.svg` },
      { name: 'TypeScript', icon: `${d}/typescript/typescript-original.svg` },
      { name: 'PHP',        icon: `${d}/php/php-original.svg` },
      { name: 'Java',       icon: `${d}/java/java-original.svg` },
      { name: 'C#',         icon: `${d}/csharp/csharp-original.svg` },
      { name: 'C++',        icon: `${d}/cplusplus/cplusplus-original.svg` },
      { name: 'C',          icon: `${d}/c/c-original.svg` },
      { name: 'Go',         icon: `${d}/go/go-original.svg` },
      { name: 'Kotlin',     icon: `${d}/kotlin/kotlin-original.svg` },
      { name: 'Swift',      icon: `${d}/swift/swift-original.svg` },
      { name: 'Dart',       icon: `${d}/dart/dart-original.svg` },
      { name: 'Ruby',       icon: `${d}/ruby/ruby-original.svg` },
      { name: 'Rust',       icon: `${d}/rust/rust-original.svg` },
      { name: 'Scala',      icon: `${d}/scala/scala-original.svg` },
      { name: 'Bash',       icon: `${d}/bash/bash-original.svg` },
    ],
  },
  {
    id: 'frameworks',
    label: 'Frameworks & Libraries',
    accent: '#0EA5E9',
    speed: 44,
    reverse: true,
    items: [
      { name: 'React',        icon: `${d}/react/react-original.svg` },
      { name: 'Next.js',      icon: `${d}/nextjs/nextjs-original.svg` },
      { name: 'Vue.js',       icon: `${d}/vuejs/vuejs-original.svg` },
      { name: 'Angular',      icon: `${d}/angularjs/angularjs-original.svg` },
      { name: 'Nuxt.js',      icon: `${d}/nuxtjs/nuxtjs-original.svg` },
      { name: 'Tailwind CSS', icon: `${d}/tailwindcss/tailwindcss-original.svg` },
      { name: 'Bootstrap',    icon: `${d}/bootstrap/bootstrap-original.svg` },
      { name: 'Sass',         icon: `${d}/sass/sass-original.svg` },
      { name: 'Node.js',      icon: `${d}/nodejs/nodejs-original.svg` },
      { name: 'Express.js',   icon: `${d}/express/express-original.svg` },
      { name: 'NestJS',       icon: `${d}/nestjs/nestjs-original.svg` },
      { name: 'Django',       icon: `${d}/django/django-plain.svg` },
      { name: 'Laravel',      icon: `${d}/laravel/laravel-original.svg` },
      { name: 'Flask',        icon: `${d}/flask/flask-original.svg` },
      { name: 'Spring Boot',  icon: `${d}/spring/spring-original.svg` },
      { name: 'FastAPI',      icon: `${d}/fastapi/fastapi-original.svg` },
      { name: 'GraphQL',      icon: `${d}/graphql/graphql-plain.svg` },
      { name: 'HTML5',        icon: `${d}/html5/html5-original.svg` },
      { name: 'CSS3',         icon: `${d}/css3/css3-original.svg` },
    ],
  },
  {
    id: 'cloud-db',
    label: 'Databases, Cloud & DevOps',
    accent: '#7C3AED',
    speed: 42,
    reverse: false,
    items: [
      { name: 'PostgreSQL',   icon: `${d}/postgresql/postgresql-original.svg` },
      { name: 'MySQL',        icon: `${d}/mysql/mysql-original.svg` },
      { name: 'MongoDB',      icon: `${d}/mongodb/mongodb-original.svg` },
      { name: 'Redis',        icon: `${d}/redis/redis-original.svg` },
      { name: 'SQLite',       icon: `${d}/sqlite/sqlite-original.svg` },
      { name: 'Firebase',     icon: `${d}/firebase/firebase-plain.svg` },
      { name: 'AWS',          icon: `${d}/amazonwebservices/amazonwebservices-plain-wordmark.svg` },
      { name: 'Google Cloud', icon: `${d}/googlecloud/googlecloud-original.svg` },
      { name: 'Azure',        icon: `${d}/azure/azure-original.svg` },
      { name: 'Vercel',       icon: `${d}/vercel/vercel-original.svg` },
      { name: 'Docker',       icon: `${d}/docker/docker-original.svg` },
      { name: 'Kubernetes',   icon: `${d}/kubernetes/kubernetes-plain.svg` },
      { name: 'Git',          icon: `${d}/git/git-original.svg` },
      { name: 'Linux',        icon: `${d}/linux/linux-original.svg` },
      { name: 'Nginx',        icon: `${d}/nginx/nginx-original.svg` },
      { name: 'Supabase',     icon: `${d}/supabase/supabase-original.svg` },
    ],
  },
  {
    id: 'mobile-ai-tools',
    label: 'Mobile, AI & Tools',
    accent: '#10B981',
    speed: 38,
    reverse: true,
    items: [
      { name: 'Flutter',      icon: `${d}/flutter/flutter-original.svg` },
      { name: 'React Native', icon: `${d}/react/react-original.svg` },
      { name: 'TensorFlow',   icon: `${d}/tensorflow/tensorflow-original.svg` },
      { name: 'PyTorch',      icon: `${d}/pytorch/pytorch-original.svg` },
      { name: 'Jupyter',      icon: `${d}/jupyter/jupyter-original.svg` },
      { name: 'OpenCV',       icon: `${d}/opencv/opencv-original.svg` },
      { name: 'Figma',        icon: `${d}/figma/figma-original.svg` },
      { name: 'Photoshop',    icon: `${d}/photoshop/photoshop-original.svg` },
      { name: 'Arduino',      icon: `${d}/arduino/arduino-original.svg` },
      { name: 'Raspberry Pi', icon: `${d}/raspberrypi/raspberrypi-original.svg` },
      { name: 'VS Code',      icon: `${d}/vscode/vscode-original.svg` },
      { name: 'Postman',      icon: `${d}/postman/postman-original.svg` },
      { name: 'Prisma',       icon: `${d}/prisma/prisma-original.svg` },
      { name: 'Notion',       icon: `${d}/notion/notion-original.svg` },
      { name: 'Keras',        icon: `${d}/keras/keras-original.svg` },
      { name: 'NumPy',        icon: `${d}/numpy/numpy-original.svg` },
    ],
  },
]

// ── Badge — uniform fixed width, zero hover effects ───────────────────────────
function TechBadge({ name, icon }: { name: string; icon: string }) {
  return (
    <div
      className="shrink-0 flex flex-col items-center justify-center gap-2 py-3 rounded-xl mx-1.5"
      style={{
        width: 88,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(103,232,249,0.10)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={icon}
        alt={name}
        width={30}
        height={30}
        className="w-7.5 h-7.5 object-contain"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement
          img.style.display = 'none'
          const fb = img.nextElementSibling as HTMLElement | null
          if (fb) fb.style.display = 'flex'
        }}
      />
      {/* fallback if icon 404s */}
      <span
        className="w-7.5 h-7.5 rounded-md items-center justify-center font-mono text-[9px] font-bold"
        style={{ display: 'none', background: 'rgba(103,232,249,0.12)', color: '#93E6FB' }}
      >
        {name.slice(0, 2).toUpperCase()}
      </span>
      <span className="font-mono text-xs text-white/45 text-center leading-tight px-1 w-full truncate">
        {name}
      </span>
    </div>
  )
}

// ── Infinite marquee row ──────────────────────────────────────────────────────
function MarqueeRow({
  items,
  speed,
  reverse,
}: {
  items: { name: string; icon: string }[]
  speed: number
  reverse: boolean
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const doubled = [...items, ...items]

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)',
      }}
      onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'paused' }}
      onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = 'running' }}
    >
      <div
        ref={trackRef}
        className="flex"
        style={{
          width: 'max-content',
          animation: `${reverse ? 'marquee-rtl' : 'marquee-ltr'} ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <TechBadge key={`${item.name}-${i}`} name={item.name} icon={item.icon} />
        ))}
      </div>

      <style>{`
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function TechMarqueeSection() {
  return (
    <div className="space-y-7">
      {CATEGORIES.map((cat) => (
        <div key={cat.id}>
          {/* Category label */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: cat.accent, boxShadow: `0 0 8px ${cat.accent}` }}
            />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold"
              style={{ color: `${cat.accent}cc` }}
            >
              {cat.label}
            </span>
            <span
              className="flex-1 h-px"
              style={{ background: `linear-gradient(to right, ${cat.accent}30, transparent)` }}
            />
          </div>

          <MarqueeRow items={cat.items} speed={cat.speed} reverse={cat.reverse} />
        </div>
      ))}
    </div>
  )
}
