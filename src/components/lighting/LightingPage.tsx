import { motion } from 'framer-motion'
import { useDeviceStore } from '../../store/deviceStore'
import { useLang } from '../../contexts/LangContext'

const SWATCHES = [
  '#f87171','#fb923c','#facc15','#78BE1F','#34d399','#60a5fa',
  '#818cf8','#a78bfa','#f472b6','#fb7185','#ffffff','#94a3b8',
]

const RAINBOW = 'linear-gradient(to right, #f87171, #fb923c, #facc15, #78BE1F, #60a5fa, #a78bfa, #f472b6)'

export default function LightingPage() {
  const { lightMode, lightColor, brightness, lightSpeed, setLightMode, setLightColor, setBrightness, setLightSpeed } = useDeviceStore()
  const { t } = useLang()

  const LIGHT_MODES = [
    { id: 0, label: t('light.mode.off') },
    { id: 1, label: t('light.mode.solid') },
    { id: 2, label: t('light.mode.breathing') },
    { id: 3, label: t('light.mode.rainbow') },
    { id: 4, label: t('light.mode.neon') },
    { id: 5, label: t('light.mode.wave') },
  ]

  const isOff      = lightMode === 0
  const isRainbow  = lightMode === 3 || lightMode === 5
  const isAnimated = lightMode === 2 || lightMode === 3 || lightMode === 4 || lightMode === 5

  const previewBg   = isOff ? 'var(--bd)' : isRainbow ? RAINBOW : lightColor
  const previewGlow = isOff ? 'none' : `0 0 16px ${isRainbow ? '#a78bfa' : lightColor}55`

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>

      {/* Mode */}
      <Section title={t('light.effectMode')}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
          {LIGHT_MODES.map(mode => (
            <button key={mode.id} onClick={() => setLightMode(mode.id)}
              style={{
                padding: '8px 6px', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600,
                border: lightMode === mode.id ? '1px solid var(--ac)' : '1px solid var(--bd)',
                background: lightMode === mode.id ? 'var(--acl)' : 'var(--bg2)',
                color: lightMode === mode.id ? 'var(--acd)' : 'var(--tx2)',
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (lightMode !== mode.id) { e.currentTarget.style.borderColor = 'var(--bd2)'; e.currentTarget.style.color = 'var(--tx)' }}}
              onMouseLeave={e => { if (lightMode !== mode.id) { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}}>
              {mode.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Controls */}
      <div style={{ opacity: isOff ? 0.3 : 1, pointerEvents: isOff ? 'none' : 'auto', transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Color */}
        {!isRainbow && (
          <Section title={t('light.color')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[SWATCHES.slice(0, 6), SWATCHES.slice(6)].map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', gap: 4 }}>
                    {row.map(c => (
                      <button key={c} onClick={() => setLightColor(c)}
                        style={{
                          flex: 1, height: 28, borderRadius: 5, background: c,
                          border: lightColor === c ? '2px solid var(--tx)' : '2px solid transparent',
                          cursor: 'pointer', padding: 0, outline: 'none',
                          transition: 'transform 0.1s', position: 'relative',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scaleY(1.1)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scaleY(1)')}>
                        {lightColor === c && (
                          <svg style={{ position: 'absolute', inset: 0, margin: 'auto' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={c === '#ffffff' ? '#000' : '#fff'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>{t('light.custom')}</span>
                <div style={{ width: 20, height: 20, borderRadius: 4, background: lightColor, border: '1px solid var(--bd)', flexShrink: 0 }} />
                <input type="color" value={lightColor} onChange={e => setLightColor(e.target.value)}
                  style={{ width: 60, height: 24, borderRadius: 4, border: '1px solid var(--bd)', background: 'var(--bg2)', cursor: 'pointer', padding: 1 }} />
                <span style={{ fontSize: 11, color: 'var(--tx3)', fontFamily: 'monospace' }}>{lightColor.toUpperCase()}</span>
              </div>
            </div>
          </Section>
        )}

        {/* Brightness */}
        <Section title={t('light.brightness')} right={`${brightness} / 5`}>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setBrightness(i + 1)}
                style={{
                  flex: 1, height: 28, borderRadius: 5,
                  background: i < brightness ? (isRainbow ? `hsl(${i * 55}, 65%, 55%)` : lightColor) : 'var(--bd)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'background 0.13s, transform 0.1s',
                  boxShadow: i < brightness && !isRainbow ? `0 0 6px ${lightColor}44` : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scaleY(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scaleY(1)')}
              />
            ))}
          </div>
        </Section>

        {/* Speed */}
        {isAnimated && (
          <Section title={t('light.speed')} right={`${lightSpeed} / 5`}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[t('light.slow'), '', '', '', t('light.fast')].map((lbl, i) => (
                <button key={i} onClick={() => setLightSpeed(i + 1)}
                  style={{
                    flex: 1, height: 28, borderRadius: 5,
                    background: lightSpeed === i + 1 ? 'var(--ac)' : 'var(--bd)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'background 0.13s, transform 0.1s',
                    fontSize: 10, fontWeight: 600,
                    color: lightSpeed === i + 1 ? 'var(--bg)' : 'var(--tx3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scaleY(1.1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scaleY(1)')}>
                  {lbl}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* LED Preview */}
        <Section title={t('light.preview')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ZonePreview label={t('light.mouseBody')} bg={previewBg} glow={previewGlow} animate={isAnimated} />
            <ZonePreview label={t('light.dpiIndicator')} bg={isOff ? 'var(--bd)' : lightColor} glow={previewGlow} animate={isAnimated} />
          </div>
        </Section>
      </div>
    </div>
  )
}

function ZonePreview({ label, bg, glow, animate }: { label: string; bg: string; glow: string; animate: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, color: 'var(--tx3)', width: 90, flexShrink: 0, alignSelf: 'center' }}>{label}</span>
      <motion.div
        animate={animate ? { opacity: [0.55, 1, 0.55] } : { opacity: 1 }}
        transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        style={{ flex: 1, height: 24, borderRadius: 6, background: bg, boxShadow: glow, transition: 'background 0.3s, box-shadow 0.3s' }}
      />
    </div>
  )
}

function Section({ title, right, children }: { title: string; right?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
        {right && <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{right}</span>}
      </div>
      {children}
    </div>
  )
}
