import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { anatomyConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Anatomy() {
  const sectionRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (pillarsRef.current) {
        gsap.fromTo(
          pillarsRef.current.children,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: pillarsRef.current,
              start: 'top 80%',
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
      id="metodo"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #07070d 0%, #0b0b15 50%, #07070d 100%)',
        padding: '140px 32px',
        overflow: 'hidden',
      }}
    >
      <div className="orb" style={{ width: '520px', height: '520px', top: '10%', right: '-160px', background: 'rgba(124,124,244,0.1)' }} />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span className="section-tag">{anatomyConfig.sectionLabel}</span>
        <h2
          style={{
            fontSize: 'clamp(34px, 4.6vw, 58px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.08,
            color: '#f2f2f7',
            margin: '24px 0 80px',
            maxWidth: '640px',
          }}
        >
          {anatomyConfig.title}
        </h2>

        <div ref={pillarsRef} style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {anatomyConfig.pillars.map((pillar, i) => (
            <article
              key={pillar.label}
              className="glass-card"
              style={{
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: i % 2 === 0 ? '1fr 1.15fr' : '1.15fr 1fr',
              }}
            >
              {/* Image side */}
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '300px',
                  order: i % 2 === 0 ? 0 : 1,
                }}
              >
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  loading="lazy"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      i % 2 === 0
                        ? 'linear-gradient(to left, rgba(7,7,13,0.5), transparent 45%)'
                        : 'linear-gradient(to right, rgba(7,7,13,0.5), transparent 45%)',
                  }}
                />
              </div>

              {/* Text side */}
              <div style={{ padding: 'clamp(32px, 4vw, 52px)' }}>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '2.5px',
                    textTransform: 'uppercase',
                    marginBottom: '16px',
                  }}
                  className="text-gradient"
                >
                  {pillar.label}
                </p>
                <h3
                  style={{
                    fontSize: 'clamp(24px, 2.6vw, 34px)',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.15,
                    color: '#f2f2f7',
                    margin: '0 0 18px',
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    lineHeight: 1.78,
                    color: 'rgba(242,242,247,0.62)',
                    margin: 0,
                  }}
                >
                  {pillar.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          #metodo article {
            grid-template-columns: 1fr !important;
          }
          #metodo article > div:first-child {
            order: 0 !important;
            min-height: 220px !important;
          }
        }
      `}</style>
    </section>
  );
}
