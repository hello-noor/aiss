import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tiersConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Tiers() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 70 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="evidenza"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: '#07070d',
        padding: '140px 32px',
        overflow: 'hidden',
      }}
    >
      <div className="orb" style={{ width: '560px', height: '560px', top: '8%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(139,92,246,0.1)' }} />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span className="section-tag" style={{ justifyContent: 'center' }}>{tiersConfig.sectionLabel}</span>
          <h2
            style={{
              fontSize: 'clamp(34px, 4.6vw, 58px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: '#f2f2f7',
              margin: '24px auto 0',
              maxWidth: '720px',
            }}
          >
            {tiersConfig.title}
          </h2>
        </div>

        <div
          ref={gridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '26px',
          }}
        >
          {tiersConfig.tiers.map((tier, i) => (
            <article
              key={tier.name}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                ...(i === 0
                  ? { borderColor: 'rgba(124,124,244,0.5)', boxShadow: '0 20px 60px rgba(99,99,232,0.18)' }
                  : {}),
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
                <img
                  src={tier.image}
                  alt={tier.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(7,7,13,0.85), transparent 55%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'rgba(7,7,13,0.6)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.16)',
                    padding: '7px 14px',
                    borderRadius: '999px',
                  }}
                >
                  {tier.tag}
                </span>
                <h3
                  style={{
                    position: 'absolute',
                    bottom: '18px',
                    left: '22px',
                    right: '22px',
                    fontSize: 'clamp(21px, 2.2vw, 26px)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                    margin: 0,
                    textShadow: '0 2px 16px rgba(0,0,0,0.5)',
                  }}
                >
                  {tier.name}
                </h3>
              </div>

              <div style={{ padding: '28px 28px 30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: '11px',
                    color: 'rgba(242,242,247,0.42)',
                    letterSpacing: '0.5px',
                    marginBottom: '16px',
                  }}
                >
                  {tier.journeys}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: 'rgba(242,242,247,0.62)',
                    margin: '0 0 22px',
                  }}
                >
                  {tier.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
                  {tier.amenities.map((a) => (
                    <li
                      key={a}
                      style={{
                        fontSize: '13px',
                        color: 'rgba(242,242,247,0.72)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        lineHeight: 1.5,
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                        <path d="M3 8.5l3.2 3.2L13 5" stroke="url(#check-g)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                          <linearGradient id="check-g" x1="0" y1="0" x2="16" y2="16">
                            <stop stopColor="#7c7cf4" />
                            <stop offset="1" stopColor="#4fd8e8" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {a}
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.ctaHref}
                  {...(tier.ctaHref.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className={i === 0 ? 'btn-primary' : 'btn-ghost'}
                  style={{ justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}
                >
                  {tier.ctaText}
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 13L13 3M13 3H5M13 3v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
