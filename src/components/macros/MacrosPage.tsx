import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, X, Circle } from 'lucide-react'
import { useDeviceStore } from '../../store/deviceStore'
import type { MacroEvent } from '../../store/deviceStore'

const EVENT_KEYS = ['LMB', 'RMB', 'MMB', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z', 'Shift','Ctrl','Alt','Win','Tab','Enter','Space','Backspace','Delete','Esc', 'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12', 'Left','Right','Up','Down']

const EVENT_COLORS: Record<string, string> = {
  keydown: 'var(--ac)',
  keyup:   'var(--tx3)',
  delay:   '#60a5fa',
}

export default function MacrosPage() {
  const { macros, activeMacroId, addMacro, deleteMacro, renameMacro, setActiveMacro, addMacroEvent, removeMacroEvent } = useDeviceStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName]   = useState('')
  const [addKey, setAddKey]       = useState('A')
  const [addDelay, setAddDelay]   = useState(50)
  const [addType, setAddType]     = useState<MacroEvent['type']>('keydown')
  const nameRef = useRef<HTMLInputElement>(null)

  const activeMacro = macros.find(m => m.id === activeMacroId) ?? null

  function startRename(id: string, name: string) {
    setEditingId(id)
    setEditName(name)
    setTimeout(() => nameRef.current?.focus(), 30)
  }

  function commitRename() {
    if (editingId && editName.trim()) renameMacro(editingId, editName.trim())
    setEditingId(null)
  }

  function handleAddEvent() {
    if (!activeMacroId) return
    if (addType === 'delay') {
      addMacroEvent(activeMacroId, { type: 'delay', ms: addDelay })
    } else {
      addMacroEvent(activeMacroId, { type: addType, key: addKey })
    }
  }

  return (
    <div style={{ padding: 16, display: 'flex', gap: 12, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>

      {/* Left: macro list */}
      <div style={{ width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Macros</span>
          <button
            onClick={addMacro}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
              border: '1px solid var(--bd)', background: 'transparent', color: 'var(--tx3)',
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.13s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac)'; e.currentTarget.style.color = 'var(--ac)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx3)' }}
          >
            <Plus size={11} /> New
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'auto' }}>
          {macros.map(macro => (
            <div
              key={macro.id}
              onClick={() => setActiveMacro(macro.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 10px', borderRadius: 'var(--r)',
                border: activeMacroId === macro.id ? '1px solid var(--ac)' : '1px solid var(--bd)',
                background: activeMacroId === macro.id ? 'var(--acl)' : 'var(--bg2)',
                cursor: 'pointer', transition: 'all 0.13s',
              }}
            >
              {editingId === macro.id ? (
                <input
                  ref={nameRef}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
                  onBlur={commitRename}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    fontSize: 12, fontWeight: 600, color: 'var(--tx)', fontFamily: 'inherit',
                  }}
                />
              ) : (
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: activeMacroId === macro.id ? 'var(--acd)' : 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {macro.name}
                </span>
              )}
              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                <IconBtn onClick={e => { e.stopPropagation(); startRename(macro.id, macro.name) }}><Edit2 size={10} /></IconBtn>
                <IconBtn onClick={e => { e.stopPropagation(); deleteMacro(macro.id) }} danger><Trash2 size={10} /></IconBtn>
              </div>
            </div>
          ))}
          {macros.length === 0 && (
            <div style={{ padding: '16px 0', textAlign: 'center', fontSize: 12, color: 'var(--tx3)' }}>No macros yet</div>
          )}
        </div>
      </div>

      {/* Right: event editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>

        {activeMacro ? (
          <>
            {/* Add event controls */}
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--bd)',
              borderRadius: 'var(--rl)', padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Add Event</span>

              {/* Type selector */}
              <div style={{ display: 'flex', gap: 5 }}>
                {(['keydown', 'keyup', 'delay'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setAddType(t)}
                    style={{
                      flex: 1, padding: '7px 8px', borderRadius: 'var(--r)',
                      border: addType === t ? '1px solid var(--ac)' : '1px solid var(--bd)',
                      background: addType === t ? 'var(--acl)' : 'transparent',
                      color: addType === t ? 'var(--acd)' : 'var(--tx2)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.12s',
                    }}
                  >
                    {t === 'keydown' ? '↓ Press' : t === 'keyup' ? '↑ Release' : '⏱ Delay'}
                  </button>
                ))}
              </div>

              {/* Key / delay picker */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {addType === 'delay' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 12, color: 'var(--tx3)' }}>Delay</span>
                    <input
                      type="number"
                      value={addDelay}
                      min={1} max={5000}
                      onChange={e => setAddDelay(Number(e.target.value))}
                      style={{
                        width: 80, padding: '5px 8px', borderRadius: 5, fontSize: 13, fontWeight: 600,
                        border: '1px solid var(--bd)', background: 'var(--bg2)', color: 'var(--tx)',
                        outline: 'none', fontVariantNumeric: 'tabular-nums',
                      }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--tx3)' }}>ms</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <span style={{ fontSize: 12, color: 'var(--tx3)' }}>Key</span>
                    <select
                      value={addKey}
                      onChange={e => setAddKey(e.target.value)}
                      style={{
                        flex: 1, padding: '5px 8px', borderRadius: 5, fontSize: 12,
                        border: '1px solid var(--bd)', background: 'var(--bg2)', color: 'var(--tx)',
                        outline: 'none',
                      }}
                    >
                      {EVENT_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                )}

                <button
                  onClick={handleAddEvent}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 'var(--r)',
                    border: '1px solid var(--ac)', background: 'var(--ac)',
                    color: 'var(--bg)', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
                  }}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>

            {/* Event sequence */}
            <div style={{
              flex: 1, overflow: 'auto',
              background: 'var(--bg)', border: '1px solid var(--bd)',
              borderRadius: 'var(--rl)', padding: '10px 12px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tx)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
                Sequence — {activeMacro.events.length} event{activeMacro.events.length !== 1 ? 's' : ''}
              </div>

              {activeMacro.events.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--tx3)' }}>
                  No events yet. Add some above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
                  {/* Timeline line */}
                  <div style={{
                    position: 'absolute', left: 15, top: 0, bottom: 0,
                    width: 1, background: 'var(--bd)',
                  }} />

                  <AnimatePresence>
                    {activeMacro.events.map((event, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.14 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '7px 8px', borderRadius: 'var(--r)',
                          background: 'var(--bg2)', border: '1px solid var(--bd)',
                          position: 'relative',
                        }}
                      >
                        {/* Timeline dot */}
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginLeft: 8,
                          background: EVENT_COLORS[event.type],
                          boxShadow: `0 0 6px ${EVENT_COLORS[event.type]}66`,
                        }} />

                        {/* Event type badge */}
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                          padding: '2px 6px', borderRadius: 4,
                          background: `${EVENT_COLORS[event.type]}20`,
                          color: EVENT_COLORS[event.type],
                        }}>
                          {event.type === 'keydown' ? 'Press' : event.type === 'keyup' ? 'Release' : 'Wait'}
                        </span>

                        {/* Value */}
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--tx)', fontVariantNumeric: 'tabular-nums' }}>
                          {event.type === 'delay' ? `${event.ms} ms` : event.key}
                        </span>

                        {/* Index */}
                        <span style={{ fontSize: 10, color: 'var(--tx3)', fontVariantNumeric: 'tabular-nums' }}>#{idx + 1}</span>

                        {/* Remove */}
                        <button
                          onClick={() => removeMacroEvent(activeMacroId!, idx)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', display: 'flex', padding: 3, borderRadius: 3, transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--rdx)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx3)')}
                        >
                          <X size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Total duration */}
            {activeMacro.events.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--tx3)', textAlign: 'right' }}>
                Total delay: {activeMacro.events.filter(e => e.type === 'delay').reduce((a, e) => a + (e.ms ?? 0), 0)} ms
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--tx3)' }}>
              <Circle size={28} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13 }}>Select or create a macro</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function IconBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: (e: React.MouseEvent) => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', display: 'flex', padding: 3, borderRadius: 3, transition: 'color 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.color = danger ? 'var(--rdx)' : 'var(--tx)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx3)')}
    >
      {children}
    </button>
  )
}
