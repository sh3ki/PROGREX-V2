'use client'

import { useRef } from 'react'

const d = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons'

const CATEGORIES = [
  {
    id: 'languages',
    label: 'Programming Languages',
    accent: '#F97316',
    speed: 38,
    reverse: false,
    items: [
      { name: 'Python',      icon: `${d}/python/python-original.svg` },
      { name: 'JavaScript',  icon: `${d}/javascript/javascript-original.svg` },
      { name: 'TypeScript',  icon: `${d}/typescript/typescript-original.svg` },
      { name: 'PHP',         icon: `${d}/php/php-original.svg` },
      { name: 'Java',        icon: `${d}/java/java-original.svg` },
      { name: 'C#',          icon: `${d}/csharp/csharp-original.svg` },
      { name: 'C++',         icon: `${d}/cplusplus/cplusplus-original.svg` },
      { name: 'Go',          icon: `${d}/go/go-original.svg` },
      { name: 'Kotlin',      icon: `${d}/kotlin/kotlin-original.svg` },
      { name: 'Swift',       icon: `${d}/swift/swift-original.svg` },
      { name: 'Dart',        icon: `${d}/dart/dart-original.svg` },
      { name: 'Ruby',        icon: `${d}/ruby/ruby-original.svg` },
      { name: 'Rust',        icon: `${d}/rust/rust-original.svg` },
      { name: 'Bash',        icon: `${d}/bash/bash-original.svg` },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend Frameworks & Libraries',
    accent: '#0EA5E9',
    speed: 42,
    reverse: true,
    items: [
      { name: 'React',        icon: `${d}/react/react-original.svg` },
      { name: 'Next.js',      icon: `${d}/nextjs/nextjs-original.svg` },
      { name: 'Vue.js',       icon: `${d}/vuejs/vuejs-original.svg` },
      { name: 'Angular',      icon: `${d}/angularjs/angularjs-original.svg` },
      { name: 'Nuxt.js',      icon: `${d}/nuxtjs/nuxtjs-original.svg` },
      { name: 'Svelte',       icon: `${d}/svelte/svelte-original.svg` },
      { name: 'Tailwind CSS', icon: `${d}/tailwindcss/tailwindcss-original.svg` },
      { name: 'Bootstrap',    icon: `${d}/bootstrap/bootstrap-original.svg` },
      { name: 'Sass',         icon: `${d}/sass/sass-original.svg` },
      { name: 'HTML5',        icon: `${d}/html5/html5-original.svg` },
      { name: 'CSS3',         icon: `${d}/css3/css3-original.svg` },
      { name: 'GraphQL',      icon: `${d}/graphql/graphql-plain.svg` },
    ],
  },
  {
    id: 'backend',
    label: 'Backend Frameworks & Runtimes',
    accent: '#A855F7',
    speed: 40,
    reverse: false,
    items: [
      { name: 'Node.js',      icon: `${d}/nodejs/nodejs-original.svg` },
      { name: 'Express.js',   icon: `${d}/express/express-original.svg` },
      { name: 'NestJS',       icon: `${d}/nestjs/nestjs-original.svg` },
      { name: 'Django',       icon: `${d}/django/django-plain.svg` },
      { name: 'Laravel',      icon: `${d}/laravel/laravel-original.svg` },
      { name: 'FastAPI',      icon: `${d}/fastapi/fastapi-original.svg` },
      { name: 'Flask',        icon: `${d}/flask/flask-original.svg` },
      { name: 'Spring Boot',  icon: `${d}/spring/spring-original.svg` },
      { name: 'Ruby on Rails',icon: `${d}/rails/rails-original-wordmark.svg` },
      { name: '.NET',         icon: `${d}/dot-net/dot-net-original.svg` },
      { name: 'Strapi',       icon: `${d}/strapi/strapi-original.svg` },
      { name: 'Bun',          icon: `${d}/bun/bun-original.svg` },
    ],
  },
  {
    id: 'databases',
    label: 'Databases & Storage',
    accent: '#10B981',
    speed: 36,
    reverse: true,
    items: [
      { name: 'PostgreSQL',   icon: `${d}/postgresql/postgresql-original.svg` },
      { name: 'MySQL',        icon: `${d}/mysql/mysql-original.svg` },
      { name: 'MongoDB',      icon: `${d}/mongodb/mongodb-original.svg` },
      { name: 'Redis',        icon: `${d}/redis/redis-original.svg` },
      { name: 'SQLite',       icon: `${d}/sqlite/sqlite-original.svg` },
      { name: 'Firebase',     icon: `${d}/firebase/firebase-plain.svg` },
      { name: 'Supabase',     icon: `${d}/supabase/supabase-original.svg` },
      { name: 'Prisma',       icon: `${d}/prisma/prisma-original.svg` },
      { name: 'Elasticsearch',icon: `${d}/elasticsearch/elasticsearch-original.svg` },
      { name: 'MariaDB',      icon: `${d}/mariadb/mariadb-original.svg` },
      { name: 'CassandraDB',  icon: `${d}/cassandra/cassandra-original.svg` },
      { name: 'DynamoDB',     icon: `${d}/dynamodb/dynamodb-original.svg` },
    ],
  },
  {
    id: 'cloud-devops',
    label: 'Cloud & DevOps',
    accent: '#7C3AED',
    speed: 44,
    reverse: false,
    items: [
      { name: 'AWS',            icon: `${d}/amazonwebservices/amazonwebservices-plain-wordmark.svg` },
      { name: 'Google Cloud',   icon: `${d}/googlecloud/googlecloud-original.svg` },
      { name: 'Azure',          icon: `${d}/azure/azure-original.svg` },
      { name: 'Vercel',         icon: `${d}/vercel/vercel-original.svg` },
      { name: 'Docker',         icon: `${d}/docker/docker-original.svg` },
      { name: 'Kubernetes',     icon: `${d}/kubernetes/kubernetes-plain.svg` },
      { name: 'Terraform',      icon: `${d}/terraform/terraform-original.svg` },
      { name: 'GitHub Actions', icon: `${d}/githubactions/githubactions-original.svg` },
      { name: 'Linux',          icon: `${d}/linux/linux-original.svg` },
      { name: 'Nginx',          icon: `${d}/nginx/nginx-original.svg` },
      { name: 'Git',            icon: `${d}/git/git-original.svg` },
      { name: 'Cloudflare',     icon: `${d}/cloudflare/cloudflare-original.svg` },
    ],
  },
  {
    id: 'mobile-ai-tools',
    label: 'Mobile, AI, Hardware & Tools',
    accent: '#F59E0B',
    speed: 38,
    reverse: true,
    items: [
      { name: 'React Native', icon: `${d}/react/react-original.svg` },
      { name: 'Flutter',      icon: `${d}/flutter/flutter-original.svg` },
      { name: 'Expo',         icon: `${d}/expo/expo-original.svg` },
      { name: 'Capacitor',    icon: `${d}/capacitor/capacitor-original.svg` },
      { name: 'Ionic',        icon: `${d}/ionic/ionic-original.svg` },
      { name: 'TensorFlow',   icon: `${d}/tensorflow/tensorflow-original.svg` },
      { name: 'PyTorch',      icon: `${d}/pytorch/pytorch-original.svg` },
      { name: 'Keras',        icon: `${d}/keras/keras-original.svg` },
      { name: 'Scikit-learn', icon: `${d}/scikitlearn/scikitlearn-original.svg` },
      { name: 'NumPy',        icon: `${d}/numpy/numpy-original.svg` },
      { name: 'Pandas',       icon: `${d}/pandas/pandas-original.svg` },
      { name: 'Jupyter',      icon: `${d}/jupyter/jupyter-original.svg` },
      { name: 'OpenCV',       icon: `${d}/opencv/opencv-original.svg` },
      { name: 'Arduino',      icon: `${d}/arduino/arduino-original.svg` },
      { name: 'Raspberry Pi', icon: `${d}/raspberrypi/raspberrypi-original.svg` },
      { name: 'Figma',        icon: `${d}/figma/figma-original.svg` },
      { name: 'Postman',      icon: `${d}/postman/postman-original.svg` },
      { name: 'VS Code',      icon: `${d}/vscode/vscode-original.svg` },
      { name: 'GitHub',       icon: `${d}/github/github-original.svg` },
      { name: 'Jira',         icon: `${d}/jira/jira-original.svg` },
      { name: 'Notion',       icon: `${d}/notion/notion-original.svg` },
    ],
  },
]

// ── Ensure enough items for seamless loop by tripling when < 8 items ──────────
function ensureEnough(items: { name: string; icon: string }[]) {
  if (items.length < 8) return [...items, ...items, ...items]
  return [...items, ...items]
}

// ── Badge ─────────────────────────────────────────────────────────────────────
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
  const looped = ensureEnough(items)
  const pct = items.length < 8 ? '-33.33%' : '-50%'

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
          animation: `${reverse ? 'svc-marquee-rtl' : 'svc-marquee-ltr'} ${speed}s linear infinite`,
        }}
      >
        {looped.map((item, i) => (
          <TechBadge key={`${item.name}-${i}`} name={item.name} icon={item.icon} />
        ))}
      </div>

      <style>{`
        @keyframes svc-marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(${pct}); }
        }
        @keyframes svc-marquee-rtl {
          from { transform: translateX(${pct}); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ServicesTechMarquee() {
  return (
    <div className="space-y-7">
      {CATEGORIES.map((cat) => (
        <div key={cat.id}>
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
