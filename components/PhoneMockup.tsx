'use client'

export default function PhoneMockup({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #03030f 0%, #08081c 100%)' }}
    >
      {/* Circuit / PCB background */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern id="pcb-phone-bg" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
            <line x1="0" y1="22" x2="16" y2="22" stroke="rgba(103,232,249,0.1)" strokeWidth="0.7" />
            <line x1="28" y1="22" x2="44" y2="22" stroke="rgba(103,232,249,0.1)" strokeWidth="0.7" />
            <line x1="22" y1="0" x2="22" y2="16" stroke="rgba(103,232,249,0.1)" strokeWidth="0.7" />
            <line x1="22" y1="28" x2="22" y2="44" stroke="rgba(103,232,249,0.1)" strokeWidth="0.7" />
            <circle cx="22" cy="22" r="3.5" fill="none" stroke="rgba(103,232,249,0.14)" strokeWidth="0.7" />
            <circle cx="22" cy="22" r="1" fill="rgba(103,232,249,0.17)" />
            <circle cx="0" cy="0" r="1" fill="rgba(103,232,249,0.07)" />
            <circle cx="44" cy="0" r="1" fill="rgba(103,232,249,0.07)" />
            <circle cx="0" cy="44" r="1" fill="rgba(103,232,249,0.07)" />
            <circle cx="44" cy="44" r="1" fill="rgba(103,232,249,0.07)" />
            {/* IC chip pads scattered */}
            <rect x="4" y="4" width="6" height="6" rx="1" fill="none" stroke="rgba(103,232,249,0.09)" strokeWidth="0.6" />
            <rect x="34" y="34" width="6" height="6" rx="1" fill="none" stroke="rgba(103,232,249,0.09)" strokeWidth="0.6" />
            <rect x="34" y="4" width="6" height="6" rx="1" fill="none" stroke="rgba(103,232,249,0.09)" strokeWidth="0.6" />
            <rect x="4" y="34" width="6" height="6" rx="1" fill="none" stroke="rgba(103,232,249,0.09)" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pcb-phone-bg)" />
      </svg>

      {/* Center radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 65% at 50% 50%, rgba(103,232,249,0.06), transparent 70%)' }}
      />

      {/* Phone shell — fills container height, aspect ratio auto-sizes width */}
      <div
        className="relative z-10 flex-shrink-0"
        style={{ height: 'calc(100% - 16px)', aspectRatio: '9 / 19' }}
      >
        {/* Outer body */}
        <div
          className="absolute inset-0 rounded-[13%]"
          style={{
            background: 'linear-gradient(160deg, #1c1c32 0%, #0e0e20 55%, #080816 100%)',
            border: '1.5px solid rgba(103,232,249,0.38)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.04) inset, ' +
              '0 0 24px rgba(103,232,249,0.1), ' +
              '0 12px 40px rgba(0,0,0,0.55)',
          }}
        />

        {/* Screen area */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: '4%',
            borderRadius: '10%',
            background: '#000',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />

          {/* Status bar overlay */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between"
            style={{
              height: '7%',
              padding: '0 8%',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)',
            }}
          >
            <span
              style={{ fontFamily: 'monospace', fontSize: '5px', color: 'rgba(255,255,255,0.45)' }}
            >
              9:41
            </span>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <div
                style={{ width: '3px', height: '3px', borderRadius: '1px', background: 'rgba(255,255,255,0.38)' }}
              />
              <div
                style={{ width: '3px', height: '3px', borderRadius: '1px', background: 'rgba(255,255,255,0.38)' }}
              />
              <div
                style={{ width: '4px', height: '3px', borderRadius: '1px', background: 'rgba(255,255,255,0.45)' }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic island */}
        <div
          className="absolute z-20"
          style={{
            top: '5.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '28%',
            height: '2.8%',
            background: '#000',
            borderRadius: '100px',
          }}
        />

        {/* Home indicator */}
        <div
          className="absolute z-20 rounded-full"
          style={{
            bottom: '2%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '28%',
            height: '0.45%',
            background: 'rgba(255,255,255,0.22)',
          }}
        />
      </div>
    </div>
  )
}
