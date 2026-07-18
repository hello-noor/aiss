import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { manifestoConfig } from '../config';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!textRef.current) return;
      const split = new SplitType(textRef.current, { types: 'words' });
      const words = split.words ?? [];

      gsap.set(words, { opacity: 0.14 });

      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: 0.06,
        scrollTrigger: {
          trigger: textRef.current,
          start: 'top 78%',
          end: 'bottom 45%',
          scrub: 0.4,
        },
      });

      return () => split.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      style={{
        position: 'relative',
        background: '#07070d',
        padding: '170px 32px 150px',
        overflow: 'hidden',
      }}
    >
      {/* Orbs */}
      <div className="orb" style={{ width: '520px', height: '520px', top: '-160px', right: '-140px', background: 'rgba(124,124,244,0.14)' }} />
      <div className="orb" style={{ width: '420px', height: '420px', bottom: '-140px', left: '-120px', background: 'rgba(79,216,232,0.09)' }} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <span className="section-tag">{manifestoConfig.sectionLabel}</span>
        <p
          ref={textRef}
          style={{
            fontSize: 'clamp(26px, 3.6vw, 44px)',
            fontWeight: 500,
            lineHeight: 1.42,
            letterSpacing: '-0.015em',
            color: '#f2f2f7',
            marginTop: '38px',
          }}
        >
          {manifestoConfig.text}
        </p>
      </div>
    </section>
  );
}
