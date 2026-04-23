import { motion } from 'framer-motion'

const CHROME_URL = 'https://www.google.com/chrome/'
const EDGE_URL = 'https://www.microsoft.com/en-us/edge'

export default function UnsupportedBrowser() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0, 0, 1] }}
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--bd)',
          borderRadius: '12px',
          boxShadow: 'var(--shm)',
          padding: '40px 36px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Warning icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          background: 'var(--aml)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--amx)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--tx)' }}>
          Browser not supported
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--tx2)', lineHeight: 1.6 }}>
          TeevoLink uses WebHID to communicate with your Terra Pro mouse.
          This technology requires <strong style={{ color: 'var(--tx)' }}>Google Chrome</strong> or{' '}
          <strong style={{ color: 'var(--tx)' }}>Microsoft Edge</strong>.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <BrowserButton
            href={CHROME_URL}
            label="Get Chrome"
            icon={<ChromeIcon />}
          />
          <BrowserButton
            href={EDGE_URL}
            label="Get Edge"
            icon={<EdgeIcon />}
          />
        </div>

        <p style={{ marginTop: 24, fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Safari and Firefox do not support WebHID
        </p>
      </motion.div>
    </div>
  )
}

function BrowserButton({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 18px',
        background: 'var(--ac)',
        color: '#fff',
        borderRadius: 'var(--r)',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        transition: 'background var(--t-fast)',
        boxShadow: '0 1px 2px var(--ac-shadow)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--acd)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--ac)')}
    >
      {icon}
      {label}
    </a>
  )
}

function ChromeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="white"/>
      <path d="M12 8h8.5a10 10 0 1 0-3 13.5" stroke="white" strokeWidth="2" fill="none"/>
    </svg>
  )
}

function EdgeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M21.2 12c0 5.1-4.1 9.2-9.2 9.2-1.9 0-3.7-.6-5.2-1.6 1.1.3 2.2.4 3.4.4 4.4 0 8-3 8.8-7h-8.8C9.6 11 8.7 9.2 8.7 7.2c0-1.3.4-2.5 1-3.5C11 2.7 13.2 2 15.6 2c2.9 0 5.6 1.4 5.6 10z"/>
    </svg>
  )
}
