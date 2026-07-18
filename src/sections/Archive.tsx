import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { archiveConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function Archive() {
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gamesRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (featuredRef.current) {
        gsap.fromTo(
          featuredRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: featuredRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (gamesRef.current) {
        gsap.fromTo(
          gamesRef.current.children,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: gamesRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
      if (groupsRef.current) {
        gsap.fromTo(
          groupsRef.current.children,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: groupsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="archivio"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #07070d 0%, #0a0a14 60%, #07070d 100%)',
        padding: '140px 32px',
        overflow: 'hidden',
      }}
    >
      <div className="orb" style={{ width: '600px', height: '600px', top: '-120px', right: '-180px', background: 'rgba(124,124,244,0.12)' }} />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: '70px', maxWidth: '720px' }}>
          <span className="section-tag">{archiveConfig.sectionLabel}</span>
          <h2
            style={{
              fontSize: 'clamp(34px, 4.6vw, 58px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: '#f2f2f7',
              margin: '24px 0 22px',
            }}
          >
            {archiveConfig.title}
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'rgba(242,242,247,0.62)', margin: '0 0 28px' }}>
            {archiveConfig.intro}
          </p>
          <a
            href={archiveConfig.repoHref}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: MONO,
              fontSize: '13px',
              color: '#f2f2f7',
              textDecoration: 'none',
              padding: '12px 22px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.03)',
              transition: 'border-color 0.3s ease, background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(124,124,244,0.6)';
              e.currentTarget.style.background = 'rgba(124,124,244,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            {archiveConfig.repoLabel}
          </a>
        </div>

        {/* Featured: Knowledge Graph */}
        <div
          ref={featuredRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            borderRadius: '26px',
            overflow: 'hidden',
            border: '1px solid rgba(124,124,244,0.4)',
            background: 'linear-gradient(135deg, rgba(99,99,232,0.1), rgba(79,216,232,0.05))',
            boxShadow: '0 30px 90px rgba(99,99,232,0.16)',
            marginBottom: '90px',
          }}
        >
          <a
            href={archiveConfig.featuredHref}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'block', overflow: 'hidden', minHeight: '340px' }}
          >
            <img
              src={archiveConfig.featuredImage}
              alt="Il Knowledge Graph della AI Summer School"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          </a>
          <div style={{ padding: 'clamp(32px, 4vw, 56px)' }}>
            <span className="section-tag">{archiveConfig.featuredLabel}</span>
            <h3
              style={{
                fontFamily: MONO,
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 600,
                color: '#f2f2f7',
                margin: '18px 0 18px',
                wordBreak: 'break-all',
              }}
            >
              {archiveConfig.featuredTitle}
            </h3>
            <p style={{ fontSize: '14.5px', lineHeight: 1.75, color: 'rgba(242,242,247,0.65)', margin: '0 0 30px' }}>
              {archiveConfig.featuredBody}
            </p>
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '34px' }}>
              {archiveConfig.featuredStats.map((stat) => {
                const [num, ...rest] = stat.split(' ');
                return (
                  <div key={stat}>
                    <p className="text-gradient" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                      {num}
                    </p>
                    <p
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: 'rgba(242,242,247,0.42)',
                        marginTop: '6px',
                      }}
                    >
                      {rest.join(' ')}
                    </p>
                  </div>
                );
              })}
            </div>
            <a href={archiveConfig.featuredHref} target="_blank" rel="noreferrer" className="btn-primary">
              {archiveConfig.featuredCta}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 13L13 3M13 3H5M13 3v8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>

        {/* Games grid with previews */}
        <div style={{ marginBottom: '90px' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(242,242,247,0.5)',
              marginBottom: '26px',
            }}
          >
            Giochi e simulazioni
          </p>
          <div
            ref={gamesRef}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))',
              gap: '20px',
            }}
          >
            {archiveConfig.games.map((file) => (
              <a
                key={file.name}
                href={file.href}
                target="_blank"
                rel="noreferrer"
                className="glass-card"
                style={{ overflow: 'hidden', textDecoration: 'none', display: 'block' }}
              >
                {file.thumb && (
                  <div style={{ overflow: 'hidden', aspectRatio: '4/3' }}>
                    <img
                      src={file.thumb}
                      alt={`Anteprima di ${file.name}`}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.07)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  </div>
                )}
                <div style={{ padding: '18px 20px 20px' }}>
                  <p
                    style={{
                      fontFamily: MONO,
                      fontSize: '12px',
                      color: '#f2f2f7',
                      margin: '0 0 6px',
                      wordBreak: 'break-all',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {file.name}
                    <span style={{ color: 'rgba(124,124,244,0.9)', flexShrink: 0 }}>↗</span>
                  </p>
                  <p style={{ fontSize: '12px', lineHeight: 1.55, color: 'rgba(242,242,247,0.52)', margin: 0 }}>
                    {file.label}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Other groups */}
        <div
          ref={groupsRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '44px 40px',
            marginBottom: '80px',
          }}
        >
          {archiveConfig.groups.map((group) => (
            <div key={group.heading}>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'rgba(242,242,247,0.5)',
                  marginBottom: '6px',
                }}
              >
                {group.heading}
              </p>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                {group.files.map((file) => (
                  <a
                    key={file.name}
                    href={file.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      textDecoration: 'none',
                      padding: '16px 14px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.045)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: '12.5px',
                        color: '#f2f2f7',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '5px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {file.name}
                      <span style={{ color: 'rgba(124,124,244,0.9)', flexShrink: 0 }}>↗</span>
                    </span>
                    <span style={{ fontSize: '12px', color: 'rgba(242,242,247,0.52)', lineHeight: 1.5 }}>
                      {file.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Closing note */}
        <div
          style={{
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '64px',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(20px, 2.6vw, 28px)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.5,
              color: 'rgba(242,242,247,0.85)',
              maxWidth: '620px',
              margin: '0 auto 32px',
              textWrap: 'balance',
            }}
          >
            {archiveConfig.closingNote}
          </p>
          <a href={archiveConfig.repoHref} target="_blank" rel="noreferrer" className="btn-ghost">
            Apri il repository
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 13L13 3M13 3H5M13 3v8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
