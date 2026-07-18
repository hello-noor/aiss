import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { aboutConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
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
      id="chi-siamo"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: '#07070d',
        padding: '130px 32px 110px',
        overflow: 'hidden',
      }}
    >
      <div className="orb" style={{ width: '480px', height: '480px', bottom: '-180px', left: '-140px', background: 'rgba(167,139,250,0.09)' }} />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span className="section-tag">{aboutConfig.sectionLabel}</span>
        <h2
          style={{
            fontSize: 'clamp(30px, 3.8vw, 46px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.12,
            color: '#f2f2f7',
            margin: '24px 0 60px',
            maxWidth: '600px',
          }}
        >
          {aboutConfig.title}
        </h2>

        <div
          ref={cardsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {aboutConfig.cards.map((card) => (
            <article key={card.title} className="glass-card" style={{ padding: 'clamp(32px, 3.6vw, 46px)' }}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  marginBottom: '14px',
                }}
                className="text-gradient"
              >
                {card.tag}
              </p>
              <h3
                style={{
                  fontSize: 'clamp(24px, 2.6vw, 32px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#f2f2f7',
                  margin: '0 0 18px',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '14.5px',
                  lineHeight: 1.78,
                  color: 'rgba(242,242,247,0.62)',
                  margin: '0 0 24px',
                }}
              >
                {card.body}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {card.points.map((point) => (
                  <li
                    key={point}
                    style={{
                      fontSize: '13px',
                      color: 'rgba(242,242,247,0.72)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      lineHeight: 1.55,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
                      <path d="M3 8.5l3.2 3.2L13 5" stroke="url(#about-check)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="about-check" x1="0" y1="0" x2="16" y2="16">
                          <stop stopColor="#7c7cf4" />
                          <stop offset="1" stopColor="#4fd8e8" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
              {card.linkHref && (
                <a
                  href={card.linkHref}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    marginTop: '26px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#a78bfa',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#4fd8e8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#a78bfa'; }}
                >
                  {card.linkLabel}
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 13L13 3M13 3H5M13 3v8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
