import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { Usb, Wifi, Crosshair, Palette, MousePointer2, Zap, Layers } from 'lucide-react'

const FEATURES = [
  { icon: <Crosshair size={13} />, label: '8 DPI stages', sub: '200 – 26,000 DPI' },
  { icon: <Palette size={13} />,   label: 'RGB lighting',  sub: 'Body + DPI indicator' },
  { icon: <MousePointer2 size={13} />, label: '6 remappable buttons', sub: 'Shortcuts + macros' },
  { icon: <Zap size={13} />,       label: 'Macro editor',  sub: 'Key sequences + delays' },
  { icon: <Layers size={13} />,    label: '4 save profiles', sub: 'Switch on the fly' },
  { icon: <Wifi size={13} />,      label: '4K wireless',   sub: 'Long-range mode' },
]

export default function ConnectScreen() {
  const navigate = useNavigate()

  async function handleConnect() {
    navigate('/dashboard')
  }

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left: Visual panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
        style={{
          flex: 1,
          borderRight: '1px solid var(--bd)',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          gap: 24,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background ambient glow */}
        <div style={{
          position: 'absolute',
          bottom: -60,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280,
          height: 200,
          background: 'radial-gradient(ellipse, rgba(120,190,31,0.12), transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Mouse photo */}
        <img
          src="/terra-pro.png"
          alt="Terra Pro"
          style={{
            width: '100%',
            maxWidth: 220,
            display: 'block',
            mixBlendMode: 'lighten',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Product info */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>
            Terra Pro
          </div>
          <div style={{ fontSize: 12, color: 'var(--tx3)' }}>by Teevolution</div>
        </div>

        {/* Spec pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['4K Wireless', '26K DPI', '6 Buttons', 'RGB'].map(spec => (
            <span key={spec} style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              padding: '3px 8px',
              borderRadius: 999,
              background: 'var(--bg2)',
              border: '1px solid var(--bd)',
              color: 'var(--tx3)',
            }}>
              {spec}
            </span>
          ))}
        </div>

        {/* Feature list */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: 0.08 + i * 0.04, ease: [0.2, 0, 0, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 'var(--r)',
                background: 'var(--bg2)',
                border: '1px solid var(--bd)',
              }}
            >
              <span style={{ color: 'var(--ac)', flexShrink: 0, display: 'flex' }}>{f.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{f.label}</span>
              <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{f.sub}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Right: Connection panel ── */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.26, ease: [0.2, 0, 0, 1] }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 56px',
          gap: 32,
        }}
      >
        {/* Headline */}
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 10px',
            borderRadius: 999,
            background: 'var(--acl)',
            border: '1px solid rgba(120,190,31,0.2)',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--acd)',
            marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }} />
            TeevoLink v1.0
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: 32, fontWeight: 800, color: 'var(--tx)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Configure your<br />
            <span style={{ color: 'var(--ac)' }}>Terra Pro</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--tx2)', lineHeight: 1.65, maxWidth: 380 }}>
            A full-featured mouse driver that runs in your browser. No install, no account. Plug in and start customizing.
          </p>
        </div>

        {/* Connection methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 400 }}>
          <ConnectOption
            icon={<Usb size={18} />}
            title="Connect via USB"
            sub="Plug in the USB cable — instant connection"
            primary
            onClick={handleConnect}
          />
          <ConnectOption
            icon={<Wifi size={18} />}
            title="Connect Wireless"
            sub="Make sure the 2.4GHz receiver is plugged in"
            primary={false}
            onClick={handleConnect}
          />
        </div>

        {/* Steps */}
        <div style={{ maxWidth: 400 }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--tx3)', marginBottom: 12 }}>
            How it works
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Connect the Terra Pro via USB or wireless receiver',
              'Chrome will ask permission to access the mouse — click Allow',
              'TeevoLink reads your current settings from the mouse',
              'Make changes — everything saves automatically',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--bg2)',
                  border: '1px solid var(--bd)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: 'var(--tx3)',
                  flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 13, color: 'var(--tx2)', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browser note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 'var(--r)',
          background: 'var(--bl)',
          border: '1px solid rgba(133,183,235,0.15)',
          maxWidth: 400,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blx)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize: 12, color: 'var(--blx)', lineHeight: 1.5 }}>
            Requires <strong>Chrome 89+</strong> or <strong>Edge 89+</strong>. Firefox and Safari are not supported.
          </span>
        </div>
      </motion.div>
    </div>
  )
}

function ConnectOption({ icon, title, sub, primary, onClick }: {
  icon: React.ReactNode
  title: string
  sub: string
  primary: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderRadius: 'var(--rl)',
        border: primary ? '1px solid var(--ac)' : '1px solid var(--bd)',
        background: primary ? 'var(--acl)' : 'var(--bg)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        width: '100%',
        transition: 'border-color var(--t-fast), background var(--t-fast)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--ac)'
        e.currentTarget.style.background = primary ? 'rgba(120,190,31,0.12)' : 'var(--bg2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = primary ? 'var(--ac)' : 'var(--bd)'
        e.currentTarget.style.background = primary ? 'var(--acl)' : 'var(--bg)'
      }}
    >
      <span style={{
        width: 40, height: 40, borderRadius: 'var(--r)',
        background: primary ? 'var(--ac)' : 'var(--bg2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: primary ? '#fff' : 'var(--tx2)',
        flexShrink: 0,
      }}>
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--tx3)' }}>{sub}</div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </motion.button>
  )
}

