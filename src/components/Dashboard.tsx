import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Battery, BatteryCharging, Zap, Crosshair, Wifi } from 'lucide-react'
import { useDeviceStore } from '../store/deviceStore'
import { useConnectionStore } from '../store/connectionStore'
import { useLang } from '../contexts/LangContext'

export default function Dashboard() {
  const { dpiStages, activeDpi, reportRate, battery } = useDeviceStore()
  const { isWired, deviceVersion, dongleVersion, status } = useConnectionStore()
  const { t } = useLang()
  const activeStage = dpiStages[activeDpi] ?? dpiStages[0]
  const c = activeStage.color
  const connected = status === 'connected'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ── Stat bar ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bd)', flexShrink: 0 }}>
        <StatCell icon={<BatteryCharging size={13} />} label={t('stat.battery')}    value={`${battery.level}%`}                sub={battery.charging ? t('stat.charging') : t('stat.onBattery')} />
        <StatCell icon={<Crosshair size={13} />}       label={t('stat.dpi')}        value={activeStage.value.toLocaleString()} sub={`${t('dpi.stage')} ${activeDpi + 1} / ${dpiStages.length}`} color={c} />
        <StatCell icon={<Zap size={13} />}             label={t('stat.pollRate')}   value={`${reportRate >= 1000 ? reportRate / 1000 + 'K' : reportRate}Hz`} sub={reportRate >= 2000 ? t('stat.highPerf') : t('stat.standard')} />
        <StatCell icon={<Wifi size={13} />}            label={t('stat.connection')} value={connected ? (isWired ? 'USB' : 'Wireless') : '—'} sub={connected ? (isWired ? 'Wired' : '2.4G Wireless') : t('shell.disconnected')} />
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ── Left panel ── */}
        <div style={{
          width: 380, flexShrink: 0,
          borderRight: '1px solid var(--bd)',
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>

          {/* Mouse stage */}
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>

            {/* Mouse + shadow wrapper */}
            <div style={{ width: '96%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <img
                src="/terra-pro.png"
                alt="Terra Pro"
                style={{
                  width: '100%',
                  display: 'block',
                  mixBlendMode: 'lighten',
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
              {/* Shadow sits right below the mouse base */}
              <div style={{
                width: '55%', height: 14,
                marginTop: -6,
                background: 'rgba(0,0,0,0.7)',
                borderRadius: '50%',
                filter: 'blur(10px)',
              }} />
            </div>
          </div>

          {/* Info cards */}
          <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>

            {/* Active DPI */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--tx3)' }}>{t('dash.activeDpi')}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 1 }}>{t('dpi.stage')} {activeDpi + 1}</div>
              </div>
              <motion.span
                key={activeStage.value}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, color: c, fontVariantNumeric: 'tabular-nums' }}
              >
                {activeStage.value >= 1000 ? `${activeStage.value / 1000}K` : activeStage.value}
              </motion.span>
            </div>

            {/* Battery */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {battery.charging ? <BatteryCharging size={13} color="white" /> : <Battery size={13} color="white" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', fontVariantNumeric: 'tabular-nums' }}>{battery.level}%</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'var(--bd)', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${battery.level}%` }}
                      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
                      style={{ height: '100%', background: battery.level > 20 ? 'var(--ac)' : 'var(--rdx)', borderRadius: 999 }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--tx3)', flexShrink: 0 }}>{battery.charging ? t('stat.charging') : '~6h'}</span>
                </div>
              </div>
            </div>

            {/* Device info */}
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[
                [t('dash.firmware'), connected ? deviceVersion : '--'],
                [t('dash.receiver'), connected ? dongleVersion : '--'],
                [t('dash.mode'),     connected ? (isWired ? 'Wired USB' : '2.4G Wireless') : '--'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--tx)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function StatCell({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string; sub: string; color?: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRight: '1px solid var(--bd)', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg2)', border: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: 'var(--tx3)', display: 'flex' }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--tx3)' }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: color ?? 'var(--tx)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.15 }}>{value}</div>
        <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{sub}</div>
      </div>
    </div>
  )
}
