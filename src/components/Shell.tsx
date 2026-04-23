import { Outlet, NavLink } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crosshair, Zap, Palette, MousePointer2,
  Settings2, ChevronLeft, ChevronRight, Wifi, WifiOff, Sun, Moon
} from 'lucide-react'
import { useLang } from '../contexts/LangContext'
import { useTheme } from '../contexts/ThemeContext'
import { useConnectionStore } from '../store/connectionStore'
import { hidBridge } from '../services/hidBridge'

const NAV_ITEMS = [
  { to: '/dashboard',          icon: <Crosshair size={16} />,     labelKey: 'nav.dpi' },
  { to: '/dashboard/lighting', icon: <Palette size={16} />,       labelKey: 'nav.lighting' },
  { to: '/dashboard/buttons',  icon: <MousePointer2 size={16} />, labelKey: 'nav.buttons' },
  { to: '/dashboard/macros',   icon: <Zap size={16} />,           labelKey: 'nav.macros' },
  { to: '/dashboard/advanced', icon: <Settings2 size={16} />,     labelKey: 'nav.advanced' },
]

const SIDEBAR_W           = 216
const SIDEBAR_W_COLLAPSED = 52

export default function Shell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLang()
  const { status } = useConnectionStore()

  const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--bg3)' }}>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'var(--overlay)',
              zIndex: 'var(--z-overlay)',
              display: 'none',
            }}
            className="mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: w }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        style={{
          width: w, minWidth: w, height: '100%',
          background: 'var(--bg)',
          borderRight: '1px solid var(--bd)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'relative',
          zIndex: 'var(--z-sidebar)', flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          height: 52,
          display: 'flex', alignItems: 'center',
          padding: collapsed ? '0 14px' : '0 16px',
          borderBottom: '1px solid var(--bd)',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <AnimatePresence mode="wait" initial={false}>
            {!collapsed && (
              <motion.div
                key="wordmark"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
              >
                <LogoWordmark />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Device status — hidden once connected */}
        <AnimatePresence>
          {!collapsed && status !== 'connected' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                margin: '10px 10px 4px', padding: '8px 10px',
                background: 'var(--bg2)', borderRadius: 'var(--rl)',
                border: '1px solid var(--bd)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--tx3)', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {t('shell.noDevice')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                  {t('shell.connectPrompt')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV_ITEMS.map(item => (
            <SidebarItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={t(item.labelKey)}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            margin: '6px', padding: '7px',
            background: 'transparent', border: '1px solid var(--bd)',
            borderRadius: 'var(--r)', color: 'var(--tx3)', cursor: 'pointer',
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            transition: 'background var(--t-fast), color var(--t-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg2)'; e.currentTarget.style.color = 'var(--tx)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--tx3)' }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={collapsed ? 'right' : 'left'}
              initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
              style={{ display: 'flex' }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </motion.span>
          </AnimatePresence>
          {!collapsed && <span style={{ fontSize: 11 }}>{t('shell.collapse')}</span>}
        </button>
      </motion.aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar onHamburger={() => setMobileOpen(o => !o)} />
        <main style={{ flex: 1, overflow: 'auto', padding: '0' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarItem({ to, icon, label, collapsed }: {
  to: string; icon: React.ReactNode; label: string; collapsed: boolean
}) {
  return (
    <NavLink
      to={to}
      end={to === '/dashboard'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 9,
        padding: collapsed ? '8px 0' : '7px 9px',
        borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500,
        textDecoration: 'none',
        color: isActive ? 'var(--acd)' : 'var(--tx2)',
        background: isActive ? 'var(--acl)' : 'transparent',
        justifyContent: collapsed ? 'center' : 'flex-start',
        transition: 'background var(--t-fast), color var(--t-fast)',
        position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap',
      })}
      onMouseEnter={e => {
        const link = e.currentTarget
        if (!link.style.background.includes('acl')) {
          link.style.background = 'var(--bg2)'
          link.style.color = 'var(--tx)'
        }
      }}
      onMouseLeave={e => {
        const link = e.currentTarget
        if (!link.classList.contains('active')) {
          link.style.background = 'transparent'
          link.style.color = 'var(--tx2)'
        }
      }}
      title={collapsed ? label : undefined}
    >
      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>
      <AnimatePresence mode="wait" initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  )
}

function ConnectionBadge() {
  const { t } = useLang()
  const { status, isWired, deviceVersion } = useConnectionStore()

  if (status === 'connected') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ac)', fontSize: 12 }}>
        <Wifi size={13} />
        <span style={{ fontWeight: 500 }}>{isWired ? 'USB' : 'Wireless'}</span>
        {deviceVersion !== '--' && (
          <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>{deviceVersion}</span>
        )}
      </div>
    )
  }

  if (status === 'connecting') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--tx3)', fontSize: 12 }}>
        <Wifi size={13} />
        <span>Connecting…</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--rdx)', fontSize: 12 }}>
      <WifiOff size={13} />
      <span>{t('shell.disconnected')}</span>
    </div>
  )
}

function Topbar({ onHamburger }: { onHamburger: () => void }) {
  return (
    <header style={{
      height: 52, display: 'flex', alignItems: 'center',
      padding: '0 20px', borderBottom: '1px solid var(--bd)',
      background: 'var(--bg)', gap: 12, flexShrink: 0,
      zIndex: 'var(--z-topbar)',
    }}>
      <button
        onClick={onHamburger}
        aria-label="Open menu"
        className="hamburger-btn"
        style={{ display: 'none', padding: 6, background: 'transparent', border: 'none', color: 'var(--tx2)', cursor: 'pointer', borderRadius: 'var(--r)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Terra Pro</span>
      </div>

      <ConnectionBadge />

      <LangToggle />
      <ThemeToggle />
      <ProfileTabs />
    </header>
  )
}

function LangToggle() {
  const { lang, setLang, t } = useLang()
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={t('shell.comingSoon')}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 9px', borderRadius: 'var(--r)',
          border: '1px solid var(--bd)', background: 'var(--bg2)',
          color: 'var(--tx2)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          transition: 'border-color var(--t-fast), color var(--t-fast)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--tx)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}
      >
        <span style={{ fontSize: 14 }}>{lang === 'zh' ? '🇨🇳' : '🇺🇸'}</span>
        <span>{lang === 'zh' ? '中文' : 'EN'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: 'var(--bg)', border: '1px solid var(--bd)',
                borderRadius: 'var(--rl)', boxShadow: 'var(--shm)',
                zIndex: 50, minWidth: 160, overflow: 'hidden',
                transformOrigin: 'top',
              }}
            >
              {[
                { code: 'en' as const, flag: '🇺🇸', label: 'English' },
                { code: 'zh' as const, flag: '🇨🇳', label: '中文' },
              ].map(item => (
                <button
                  key={item.code}
                  onClick={() => { setLang(item.code); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, width: '100%',
                    padding: '8px 12px', border: 'none', background: lang === item.code ? 'var(--acl)' : 'transparent',
                    color: lang === item.code ? 'var(--acd)' : 'var(--tx)', cursor: 'pointer',
                    fontSize: 13, fontWeight: lang === item.code ? 600 : 400,
                    fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (lang !== item.code) e.currentTarget.style.background = 'var(--bg2)' }}
                  onMouseLeave={e => { if (lang !== item.code) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ fontSize: 16 }}>{item.flag}</span>
                  {item.label}
                  {lang === item.code && <span style={{ marginLeft: 'auto', color: 'var(--ac)', fontSize: 11 }}>✓</span>}
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--bd)', padding: '6px 12px' }}>
                <span style={{ fontSize: 10, color: 'var(--tx3)' }}>{t('shell.comingSoon')}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.96 }}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 'var(--r)',
        border: '1px solid var(--bd)', background: 'var(--bg2)',
        color: 'var(--tx2)', cursor: 'pointer',
        transition: 'border-color var(--t-fast), color var(--t-fast)',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--tx)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.25, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          style={{ display: 'flex' }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function ProfileTabs() {
  const { activeProfile, status } = useConnectionStore()
  const profiles = ['P1', 'P2', 'P3', 'P4']
  const disabled = status !== 'connected'
  return (
    <div style={{
      display: 'flex', gap: 2, background: 'var(--bg2)', padding: 3,
      borderRadius: 'var(--rl)', border: '1px solid var(--bd)',
      opacity: disabled ? 0.45 : 1, transition: 'opacity 0.15s',
    }}>
      {profiles.map((p, i) => (
        <button key={i}
          onClick={() => { if (!disabled) hidBridge.setProfile(i) }}
          disabled={disabled}
          style={{
            padding: '4px 12px', borderRadius: 5, border: 'none', fontSize: 11, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: disabled ? 'default' : 'pointer',
            background: activeProfile === i ? 'var(--bg)' : 'transparent',
            color: activeProfile === i ? 'var(--tx)' : 'var(--tx3)',
            boxShadow: activeProfile === i ? 'var(--sh)' : 'none',
            transition: 'background var(--t-fast), color var(--t-fast)',
          }}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

function LogoWordmark() {
  const { theme } = useTheme()
  return (
    <img
      src="/logo-dark.svg"
      height="13"
      alt="Teevolution"
      style={{ display: 'block', filter: theme === 'light' ? 'invert(1)' : 'none' }}
    />
  )
}
