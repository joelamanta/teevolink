import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { useDeviceStore } from '../../store/deviceStore'
import { useLang } from '../../contexts/LangContext'

const DEBOUNCE_OPT = [4, 8, 12, 16, 20, 24, 32]
const SLEEP_OPT    = [1, 2, 3, 5, 10, 15]

export default function AdvancedPage() {
  const { lod, debounce, angleSnap, motionSync, longRange, sleepTime, ripple, setLod, setDebounce, setAngleSnap, setMotionSync, setLongRange, setSleepTime, setRipple } = useDeviceStore()
  const { t } = useLang()
  const [resetConfirm, setResetConfirm] = useState(false)

  const LOD_LABELS = [t('adv.lod.low'), t('adv.lod.med'), t('adv.lod.high')]

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>

      {/* Sensor */}
      <Section title={t('adv.sensor')} right="PMW3395">
        <Row label={t('adv.liftOff')} sub={t('adv.liftOffSub')}>
          <ChipGroup options={LOD_LABELS} active={lod} onChange={setLod} />
        </Row>
        <Divider />
        <Row label={t('adv.angleSnap')} sub={t('adv.angleSnapSub')}>
          <Toggle value={angleSnap} onChange={setAngleSnap} />
        </Row>
        <Divider />
        <Row label={t('adv.debounce')} sub={t('adv.debounceSub')}>
          <ChipGroup options={DEBOUNCE_OPT.map(v => `${v}ms`)} active={DEBOUNCE_OPT.indexOf(debounce)} onChange={i => setDebounce(DEBOUNCE_OPT[i])} mono />
        </Row>
      </Section>

      {/* Wireless */}
      <Section title={t('adv.wireless')} right="2.4 GHz">
        <Row label={t('adv.longRange')} sub={t('adv.longRangeSub')}>
          <Toggle value={longRange} onChange={setLongRange} />
        </Row>
        <Divider />
        <Row label={t('adv.motionSync')} sub={t('adv.motionSyncSub')}>
          <Toggle value={motionSync} onChange={setMotionSync} />
        </Row>
        <Divider />
        <Row label={t('adv.autoSleep')} sub={t('adv.autoSleepSub')}>
          <ChipGroup options={SLEEP_OPT.map(v => `${v}m`)} active={SLEEP_OPT.indexOf(sleepTime)} onChange={i => setSleepTime(SLEEP_OPT[i])} mono />
        </Row>
      </Section>

      {/* Performance */}
      <Section title={t('adv.performance')} right="">
        <Row label={t('adv.ripple')} sub={t('adv.rippleSub')}>
          <Toggle value={ripple} onChange={setRipple} />
        </Row>
      </Section>

      {/* Device Info */}
      <Section title={t('adv.deviceInfo')} right="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            [t('adv.product'), 'Terra Pro'],
            [t('adv.firmware'), 'v1.0.4'],
            [t('adv.receiverFW'), 'v1.0'],
            ['Sensor', 'PMW3395'],
            [t('adv.maxDpi'), '26,000'],
            [t('adv.usbPid'), '0x2D22'],
            ['Wireless', '2.4 GHz 4K'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--bd)' }}>
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Reset */}
      <Section title={t('adv.reset')} right="">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 'var(--r)', background: 'var(--aml)', border: '1px solid rgba(250,199,117,0.12)' }}>
          <AlertTriangle size={12} color="var(--amx)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: 'var(--amx)', lineHeight: 1.5 }}>
            {t('adv.resetWarning')}
          </span>
        </div>
        {resetConfirm ? (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'transparent', color: 'var(--tx2)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('adv.cancel')}</button>
            <button onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: '7px', borderRadius: 'var(--r)', border: '1px solid var(--rdx)', background: 'var(--rdl)', color: 'var(--rdx)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t('adv.confirmReset')}</button>
          </div>
        ) : (
          <button onClick={() => setResetConfirm(true)}
            style={{ padding: '7px', borderRadius: 'var(--r)', border: '1px solid var(--bd)', background: 'transparent', color: 'var(--tx3)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.12s', width: '100%' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--rdx)'; e.currentTarget.style.color = 'var(--rdx)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx3)' }}>
            {t('adv.resetBtn')}
          </button>
        )}
      </Section>
    </div>
  )
}

// ─── Primitives ───────────────────────────────────────────────

function Section({ title, right, children }: { title: string; right: string; children: React.ReactNode }) {
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

function Row({ label, sub, children }: { label: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.4 }}>{sub}</div>
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>{children}</div>
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--bd)' }} />
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width: 38, height: 22, borderRadius: 999, background: value ? 'var(--ac)' : 'var(--bg3)', border: `1px solid ${value ? 'transparent' : 'var(--bd2)'}`, position: 'relative', cursor: 'pointer', padding: 0, transition: 'background 0.14s', flexShrink: 0 }}>
      <motion.div animate={{ left: value ? 18 : 2 }} transition={{ duration: 0.14, ease: [0.2, 0, 0, 1] }}
        style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: 999, background: value ? 'var(--bg)' : 'var(--tx3)' }} />
    </button>
  )
}

function ChipGroup({ options, active, onChange, mono }: { options: string[]; active: number; onChange: (i: number) => void; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
      {options.map((opt, i) => (
        <button key={opt} onClick={() => onChange(i)}
          style={{
            padding: '4px 9px', borderRadius: 5, fontSize: 11, fontWeight: 600,
            border: active === i ? '1px solid var(--ac)' : '1px solid var(--bd)',
            background: active === i ? 'var(--acl)' : 'transparent',
            color: active === i ? 'var(--acd)' : 'var(--tx2)',
            cursor: 'pointer', fontFamily: 'inherit', fontVariantNumeric: mono ? 'tabular-nums' : undefined,
            transition: 'all 0.11s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (active !== i) { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--tx)' }}}
          onMouseLeave={e => { if (active !== i) { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}}>
          {opt}
        </button>
      ))}
    </div>
  )
}
