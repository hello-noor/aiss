import { footerConfig } from '../config';

export default function Footer() {
  return (
    <footer
      style={{
        position: 'relative',
        background: '#05050a',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '90px 32px 44px',
        overflow: 'hidden',
      }}
    >
      <div className="orb" style={{ width: '460px', height: '460px', bottom: '-200px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(124,124,244,0.08)' }} />

      <div style={{ maxWidth: '1240px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '48px 32px',
            marginBottom: '80px',
          }}
        >
          {/* Brand */}
          <div>
            <p
              style={{
                fontSize: '15px',
                fontStyle: 'italic',
                color: 'rgba(242,242,247,0.6)',
                marginBottom: '22px',
              }}
            >
              {footerConfig.ageGateText}
            </p>
            <p style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '4px', color: '#f2f2f7', margin: '0 0 14px' }}>
              AI<span className="text-gradient">SS</span>
            </p>
            {footerConfig.brandTaglineLines.map((line) => (
              <p key={line} style={{ fontSize: '13px', color: 'rgba(242,242,247,0.45)', margin: '3px 0', lineHeight: 1.6 }}>
                {line}
              </p>
            ))}
          </div>

          {/* Link columns */}
          {footerConfig.columns.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  textTransform: 'uppercase',
                  color: 'rgba(242,242,247,0.45)',
                  marginBottom: '18px',
                }}
              >
                {col.heading}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    style={{
                      fontSize: '14px',
                      color: 'rgba(242,242,247,0.68)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(242,242,247,0.68)'; }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '12px', color: 'rgba(242,242,247,0.38)', margin: 0 }}>
            {footerConfig.copyright}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(242,242,247,0.3)', margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            hello-noor.github.io/aiss
          </p>
        </div>
      </div>
    </footer>
  );
}
