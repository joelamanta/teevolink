import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useDeviceStore } from '../../store/deviceStore'
import { useLang } from '../../contexts/LangContext'

const BTN_LABEL: Record<number, string> = { 0:'L', 1:'R', 2:'M', 3:'B', 4:'F', 5:'D' }

const MOUSE_FNS   = ['Left Click','Right Click','Middle Click','Back Button','Forward Button','Double Click']
const DPI_FNS     = ['DPI Switch','DPI Up','DPI Down','DPI Loop','DPI Lock']
const MEDIA_FNS   = ['Play / Pause','Next Track','Prev Track','Volume Up','Volume Down','Mute']
const PROFILE_FNS = ['Profile 1','Profile 2','Profile 3','Profile 4','Profile Cycle']
const MACRO_FNS   = ['Macro 1','Macro 2','Macro 3','Macro 4']
const SYSTEM_FNS  = ['Sniper Mode','Fire Button','Disabled']

export default function ButtonsPage() {
  const { buttonMap, setButtonFn } = useDeviceStore()
  const { t } = useLang()
  const [openId, setOpenId] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const FUNCTION_GROUPS = [
    { label: t('btn.group.mouse'),   fns: MOUSE_FNS },
    { label: t('btn.group.dpi'),     fns: DPI_FNS },
    { label: t('btn.group.media'),   fns: MEDIA_FNS },
    { label: t('btn.group.profile'), fns: PROFILE_FNS },
    { label: t('btn.group.macro'),   fns: MACRO_FNS },
    { label: t('btn.group.system'),  fns: SYSTEM_FNS },
  ]

  const filtered = search.trim()
    ? FUNCTION_GROUPS.map(g => ({ ...g, fns: g.fns.filter(f => f.toLowerCase().includes(search.toLowerCase())) })).filter(g => g.fns.length > 0)
    : FUNCTION_GROUPS

  return (
    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100%', boxSizing: 'border-box', overflow: 'auto' }}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--bd)', borderRadius: 'var(--rl)', padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('btn.mapping')}</span>
          <span style={{ fontSize: 11, color: 'var(--tx3)' }}>{t('btn.count')}</span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4, paddingLeft: 2 }}>{t('btn.hint')}</div>
        {buttonMap.map((btn, i) => (
          <motion.div key={btn.id} initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.12, delay: i * 0.025 }} style={{ position: 'relative' }}>
            <div
              onClick={() => { setOpenId(openId === btn.id ? null : btn.id); setSearch('') }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 'var(--r)',
                border: openId === btn.id ? '1px solid var(--ac)' : '1px solid transparent',
                background: openId === btn.id ? 'var(--acl)' : 'transparent',
                cursor: 'pointer', transition: 'border-color 0.12s, background 0.12s',
              }}
              onMouseEnter={e => { if (openId !== btn.id) e.currentTarget.style.background = 'var(--bg2)' }}
              onMouseLeave={e => { if (openId !== btn.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                background: openId === btn.id ? 'var(--ac)' : 'var(--bg2)',
                border: `1px solid ${openId === btn.id ? 'transparent' : 'var(--bd)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: openId === btn.id ? 'var(--bg)' : 'var(--tx3)',
                fontFamily: 'monospace', transition: 'background 0.12s, color 0.12s, border-color 0.12s',
              }}>
                {BTN_LABEL[btn.id]}
              </div>

              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--tx)' }}>{btn.label}</span>

              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx2)', padding: '2px 9px', background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 4 }}>
                {btn.fn}
              </span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--tx3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, transform: openId === btn.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.13s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {openId === btn.id && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scaleY: 0.96 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -4, scaleY: 0.96 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0,
                    background: 'var(--bg)', border: '1px solid var(--bd)',
                    borderRadius: 'var(--rl)', zIndex: 50, boxShadow: 'var(--shm)',
                    transformOrigin: 'top', overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '7px 8px', borderBottom: '1px solid var(--bd)' }}>
                    <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={t('btn.search')}
                      style={{ width: '100%', padding: '5px 8px', borderRadius: 5, border: '1px solid var(--bd)', background: 'var(--bg2)', color: 'var(--tx)', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ maxHeight: 240, overflow: 'auto', padding: '5px 6px' }}>
                    {filtered.map(group => (
                      <div key={group.label} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--tx3)', padding: '2px 4px 3px' }}>{group.label}</div>
                        {group.fns.map(fn => (
                          <button key={fn}
                            onClick={() => { setButtonFn(btn.id, fn); setOpenId(null); setSearch('') }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '6px 8px', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 500, color: btn.fn === fn ? 'var(--acd)' : 'var(--tx)', transition: 'background 0.1s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            {fn}
                            {btn.fn === fn && <Check size={11} color="var(--ac)" />}
                          </button>
                        ))}
                      </div>
                    ))}
                    {filtered.length === 0 && <div style={{ padding: '10px 8px', fontSize: 12, color: 'var(--tx3)', textAlign: 'center' }}>{t('btn.noResults')}</div>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
