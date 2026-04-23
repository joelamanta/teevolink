import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useDeviceStore, STAGE_COLORS } from '../../store/deviceStore'
import { useLang } from '../../contexts/LangContext'

const REPORT_RATES = [125, 250, 500, 1000, 2000, 4000, 8000]
const DPI_PRESETS  = [200, 400, 800, 1200, 1600, 2400, 3200, 6400, 12800, 16000, 19000, 26000]

export default function DPIPage() {
  const {
    dpiStages, activeDpi, selectedStageIdx,
    reportRate, motionSync, ripple, longRange, sleepTime, lod, debounce,
    setActiveDpi, setSelectedStageIdx, setDpiStageValue, setDpiStageColor,
    addDpiStage, removeDpiStage,
    setReportRate, setMotionSync, setRipple, setLongRange, setSleepTime, setLod, setDebounce,
  } = useDeviceStore()
  const { t } = useLang()

  const selectedStage = dpiStages[selectedStageIdx]
  const lodLabels = [t('dpi.lod.low'), t('dpi.lod.med'), t('dpi.lod.high')]

  function handleStageClick(i: number) {
    setSelectedStageIdx(i)
    setActiveDpi(i)
  }

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>

      {/* DPI Stages */}
      <Section title={t('dpi.stages')} right={`${dpiStages.length} / 8`}>
        <div style={{ display: 'flex', gap: 6 }}>
          {dpiStages.map((stage, i) => (
            <motion.button
              key={stage.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleStageClick(i)}
              style={{
                flex: 1, height: 88,
                display: 'flex', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 'var(--r)',
                border: selectedStageIdx === i ? `1.5px solid ${stage.color}` : '1px solid var(--bd)',
                background: selectedStageIdx === i ? `${stage.color}10` : 'var(--bg2)',
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.13s', position: 'relative',
              }}
            >
              {activeDpi === i && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 5, height: 5, borderRadius: '50%',
                  background: stage.color, boxShadow: `0 0 5px ${stage.color}`,
                }} />
              )}
              <div style={{
                padding: '3px 4px',
                borderRadius: 4,
                border: '1px solid var(--bd)',
                background: 'var(--bg3)',
                display: 'inline-flex',
              }}>
                <div style={{ width: 16, height: 6, borderRadius: 2, background: stage.color }} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: 'var(--tx)', fontVariantNumeric: 'tabular-nums' }}>
                  {stage.value >= 1000 ? `${stage.value / 1000}K` : stage.value}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('dpi.unit')}</div>
              </div>
            </motion.button>
          ))}

          {dpiStages.length < 8 && (
            <button
              onClick={addDpiStage}
              style={{
                width: 52, height: 88, flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, borderRadius: 'var(--r)', border: '1px dashed var(--bd)',
                background: 'transparent', color: 'var(--tx3)',
                cursor: 'pointer', fontSize: 10, fontWeight: 600,
                transition: 'border-color 0.13s, color 0.13s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--ac)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx3)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {t('dpi.add')}
            </button>
          )}
        </div>
      </Section>

      {/* Stage editor */}
      <AnimatePresence mode="wait">
        {selectedStage && (
          <motion.div key={selectedStage.id} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.13 }}>
            <Section
              title={`${t('dpi.stage')} ${selectedStageIdx + 1}`}
              right={selectedStage.value.toLocaleString() + ' DPI'}
              rightColor={selectedStage.color}
              action={
                dpiStages.length > 1 ? (
                  <button onClick={() => removeDpiStage(selectedStageIdx)} style={iconBtnStyle}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--rdx)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx3)')}>
                    <Trash2 size={12} />
                  </button>
                ) : undefined
              }
            >
              <div style={{ display: 'flex', gap: 14 }}>
                {/* Left: value */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SmallLabel>{t('dpi.value')}</SmallLabel>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {DPI_PRESETS.map(p => (
                      <button key={p} onClick={() => setDpiStageValue(selectedStageIdx, p)}
                        style={{
                          padding: '5px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                          border: selectedStage.value === p ? `1px solid ${selectedStage.color}` : '1px solid var(--bd)',
                          background: selectedStage.value === p ? `${selectedStage.color}18` : 'transparent',
                          color: selectedStage.value === p ? selectedStage.color : 'var(--tx2)',
                          cursor: 'pointer', fontVariantNumeric: 'tabular-nums', transition: 'all 0.1s',
                        }}>
                        {p >= 1000 ? `${p / 1000}K` : p}
                      </button>
                    ))}
                  </div>
                  <DPISlider value={selectedStage.value} color={selectedStage.color} onChange={v => setDpiStageValue(selectedStageIdx, v)} />
                </div>

                {/* Right: color */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SmallLabel>{t('dpi.color')}</SmallLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[STAGE_COLORS.slice(0, 4), STAGE_COLORS.slice(4)].map((row, ri) => (
                      <div key={ri} style={{ display: 'flex', gap: 4 }}>
                        {row.map(c => (
                          <button key={c} onClick={() => setDpiStageColor(selectedStageIdx, c)}
                            style={{
                              width: 30, height: 30, borderRadius: 6, background: c, flexShrink: 0,
                              border: selectedStage.color === c ? '2px solid var(--tx)' : '2px solid transparent',
                              cursor: 'pointer', padding: 0, outline: 'none', transition: 'transform 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Rate */}
      <Section title={t('dpi.reportRate')} right={t('dpi.polling')}>
        <div style={{ display: 'flex', gap: 5 }}>
          {REPORT_RATES.map(rate => (
            <button key={rate} onClick={() => setReportRate(rate)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 'var(--r)',
                border: reportRate === rate ? '1px solid var(--ac)' : '1px solid var(--bd)',
                background: reportRate === rate ? 'var(--acl)' : 'transparent',
                color: reportRate === rate ? 'var(--acd)' : 'var(--tx2)',
                fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
                fontVariantNumeric: 'tabular-nums', cursor: 'pointer', transition: 'all 0.12s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}
              onMouseEnter={e => { if (reportRate !== rate) { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--tx)' }}}
              onMouseLeave={e => { if (reportRate !== rate) { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}}>
              {rate >= 1000 ? `${rate / 1000}K` : rate}
              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.55 }}>Hz</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Quick Settings */}
      <Section title={t('dpi.quickSettings')} right="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <InlineRow label={t('dpi.motionSync')}><SmallToggle value={motionSync} onChange={setMotionSync} /></InlineRow>
          <InlineRow label={t('dpi.rippleControl')}><SmallToggle value={ripple} onChange={setRipple} /></InlineRow>
          <InlineRow label={t('dpi.longRange')}><SmallToggle value={longRange} onChange={setLongRange} /></InlineRow>
          <InlineRow label={t('dpi.sleepTimeout')}>
            <Stepper value={`${sleepTime}m`} onDec={() => setSleepTime(Math.max(1, sleepTime - 1))} onInc={() => setSleepTime(Math.min(15, sleepTime + 1))} />
          </InlineRow>
          <InlineRow label={t('dpi.liftOff')}>
            <Stepper value={lodLabels[lod]} onDec={() => setLod(Math.max(0, lod - 1))} onInc={() => setLod(Math.min(2, lod + 1))} />
          </InlineRow>
          <InlineRow label={t('dpi.debounce')}>
            <Stepper value={`${debounce}ms`} onDec={() => setDebounce(Math.max(4, debounce - 4))} onInc={() => setDebounce(Math.min(32, debounce + 4))} />
          </InlineRow>
        </div>
      </Section>
    </div>
  )
}

// ─── Slider ───────────────────────────────────────────────────
function DPISlider({ value, color, onChange }: { value: number; color: string; onChange: (v: number) => void }) {
  const min = 200, max = 26000
  const pct = ((value - min) / (max - min)) * 100
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const raw = Math.round((min + Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * (max - min)) / 100) * 100
    onChange(Math.max(min, Math.min(max, raw)))
  }
  return (
    <div onClick={handleClick} style={{ position: 'relative', height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 4, borderRadius: 999, background: 'var(--bd)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, boxShadow: `0 0 6px ${color}55`, transition: 'width 0.08s' }} />
      </div>
      <div style={{
        position: 'absolute', left: `${pct}%`, top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 14, height: 14, borderRadius: '50%',
        background: color, border: '2px solid var(--bg)',
        boxShadow: `0 0 8px ${color}77`, pointerEvents: 'none', transition: 'left 0.08s',
      }} />
    </div>
  )
}

// ─── Layout helpers ───────────────────────────────────────────
function Section({ title, right, rightColor, action, children }: {
  title: string; right?: string; rightColor?: string; action?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {right && <span style={{ fontSize: 13, fontWeight: 600, color: rightColor ?? 'var(--tx3)' }}>{right}</span>}
          {action}
        </div>
      </div>
      {children}
    </div>
  )
}

function SmallLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</span>
}

function InlineRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 2px', borderBottom: '1px solid var(--bd)' }}>
      <span style={{ fontSize: 13, color: 'var(--tx2)' }}>{label}</span>
      {children}
    </div>
  )
}

function SmallToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 36, height: 20, borderRadius: 999, background: value ? 'var(--ac)' : 'var(--bg3)', border: `1px solid ${value ? 'transparent' : 'var(--bd2)'}`, position: 'relative', cursor: 'pointer', padding: 0, transition: 'background 0.15s', flexShrink: 0 }}>
      <motion.div animate={{ left: value ? 17 : 2 }} transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
        style={{ position: 'absolute', top: 2, width: 14, height: 14, borderRadius: 999, background: value ? 'var(--bg)' : 'var(--tx3)' }} />
    </button>
  )
}

function Stepper({ value, onDec, onInc }: { value: string; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <button onClick={onDec} style={stepBtn}>−</button>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', minWidth: 34, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      <button onClick={onInc} style={stepBtn}>+</button>
    </div>
  )
}

const stepBtn: React.CSSProperties = { width: 22, height: 22, borderRadius: 4, border: '1px solid var(--bd)', background: 'var(--bg2)', color: 'var(--tx2)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontFamily: 'inherit', lineHeight: 1 }
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', display: 'flex', padding: 4, borderRadius: 4, transition: 'color 0.12s' }
