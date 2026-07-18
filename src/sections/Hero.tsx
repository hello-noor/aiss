import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { heroConfig } from '../config';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current.children,
          { opacity: 0, y: 34, filter: 'blur(10px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: 0.13, ease: 'power3.out', delay: 0.2 }
        );
      }
      if (imgRef.current) {
        gsap.fromTo(
          imgRef.current,
          { scale: 1.12 },
          { scale: 1, duration: 2.2, ease: 'power2.out' }
        );
        gsap.to(imgRef.current, {
          yPercent: 14,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollTo = (target: string) => {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="top"
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        background: '#07070d',
      }}
    >
      {/* Background image with parallax */}
      <img
        ref={imgRef}
        src={heroConfig.imagePath}
        alt="L'aula della AI Summer School"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          willChange: 'transform',
        }}
      />

      {/* Gradient scrims */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'linear-gradient(to top, #07070d 4%, rgba(7,7,13,0.82) 30%, rgba(7,7,13,0.35) 58%, rgba(7,7,13,0.45) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'radial-gradient(ellipse 90% 60% at 30% 90%, rgba(99,99,232,0.22), transparent 60%)',
        }}
      />

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '0 32px 84px',
        }}
      >
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(242,242,247,0.75)',
            marginBottom: '26px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(100deg, #7c7cf4, #4fd8e8)',
              display: 'inline-block',
              boxShadow: '0 0 16px rgba(124,124,244,0.9)',
            }}
          />
          {heroConfig.eyebrow}
        </p>

        <h1
          style={{
            fontSize: 'clamp(52px, 9vw, 116px)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            color: '#f2f2f7',
            margin: 0,
          }}
        >
          {heroConfig.titleLine}
          <br />
          <span className="text-gradient">{heroConfig.titleEmphasis}</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)',
            lineHeight: 1.65,
            color: 'rgba(242,242,247,0.72)',
            maxWidth: '560px',
            margin: '28px 0 38px',
          }}
        >
          {heroConfig.subtitle}
        </p>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '64px' }}>
          <a
            href={heroConfig.primaryHref}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            {heroConfig.primaryCta}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 13L13 3M13 3H5M13 3v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={heroConfig.secondaryHref}
            className="btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(heroConfig.secondaryHref);
            }}
          >
            {heroConfig.secondaryCta}
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M8 3v10M8 13l-5-5M8 13l5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            gap: 'clamp(28px, 5vw, 72px)',
            flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: '30px',
          }}
        >
          {heroConfig.stats.map((s) => (
            <div key={s.label}>
              <p
                style={{
                  fontSize: 'clamp(28px, 3.4vw, 42px)',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
                className="text-gradient"
              >
                {s.value}
              </p>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'rgba(242,242,247,0.45)',
                  marginTop: '6px',
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
