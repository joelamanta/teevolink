import { create } from 'zustand'

export interface DPIStage { id: string; value: number; color: string }
export interface ButtonBinding { id: number; label: string; fn: string }
export type MacroEventType = 'keydown' | 'keyup' | 'delay'
export interface MacroEvent { type: MacroEventType; key?: string; ms?: number }
export interface Macro { id: string; name: string; events: MacroEvent[] }

const STAGE_COLORS = ['#f87171','#fb923c','#facc15','#78BE1F','#60a5fa','#a78bfa','#f472b6','#ffffff']

interface DeviceState {
  dpiStages: DPIStage[]
  activeDpi: number
  selectedStageIdx: number
  lightMode: number
  lightColor: string
  brightness: number
  lightSpeed: number
  reportRate: number
  motionSync: boolean
  ripple: boolean
  longRange: boolean
  sleepTime: number
  lod: number
  debounce: number
  angleSnap: boolean
  buttonMap: ButtonBinding[]
  macros: Macro[]
  activeMacroId: string | null
  battery: { level: number; charging: boolean }
}

export interface DeviceSnapshot {
  dpiStages: DPIStage[]
  activeDpi: number
  selectedStageIdx: number
  lightMode: number
  lightColor: string
  brightness: number
  lightSpeed: number
  reportRate: number
  motionSync: boolean
  ripple: boolean
  longRange: boolean
  sleepTime: number
  lod: number
  debounce: number
  angleSnap: boolean
  battery: { level: number; charging: boolean }
  buttonMap?: ButtonBinding[]
}

interface DeviceActions {
  loadFromDevice: (snap: DeviceSnapshot) => void
  updateBattery: (b: { level: number; charging: boolean }) => void
  setActiveDpi: (i: number) => void
  setSelectedStageIdx: (i: number) => void
  setDpiStageValue: (i: number, v: number) => void
  setDpiStageColor: (i: number, c: string) => void
  addDpiStage: () => void
  removeDpiStage: (i: number) => void
  setLightMode: (i: number) => void
  setLightColor: (c: string) => void
  setBrightness: (v: number) => void
  setLightSpeed: (v: number) => void
  setReportRate: (r: number) => void
  setMotionSync: (v: boolean) => void
  setRipple: (v: boolean) => void
  setLongRange: (v: boolean) => void
  setSleepTime: (t: number) => void
  setLod: (l: number) => void
  setDebounce: (ms: number) => void
  setAngleSnap: (v: boolean) => void
  setButtonFn: (id: number, fn: string) => void
  addMacro: () => void
  deleteMacro: (id: string) => void
  renameMacro: (id: string, name: string) => void
  setActiveMacro: (id: string | null) => void
  addMacroEvent: (macroId: string, event: MacroEvent) => void
  removeMacroEvent: (macroId: string, idx: number) => void
}

export const useDeviceStore = create<DeviceState & DeviceActions>((set) => ({
  dpiStages: [
    { id: 's1', value: 400,  color: '#f87171' },
    { id: 's2', value: 800,  color: '#fb923c' },
    { id: 's3', value: 1600, color: '#78BE1F' },
    { id: 's4', value: 3200, color: '#60a5fa' },
  ],
  activeDpi: 2,
  selectedStageIdx: 2,
  lightMode: 2,
  lightColor: '#78BE1F',
  brightness: 3,
  lightSpeed: 3,
  reportRate: 1000,
  motionSync: false,
  ripple: true,
  longRange: false,
  sleepTime: 3,
  lod: 1,
  debounce: 8,
  angleSnap: false,
  buttonMap: [
    { id: 0, label: 'Left Click',   fn: 'Left Click' },
    { id: 1, label: 'Right Click',  fn: 'Right Click' },
    { id: 2, label: 'Middle Click', fn: 'Middle Click' },
    { id: 3, label: 'Back',         fn: 'Back Button' },
    { id: 4, label: 'Forward',      fn: 'Forward Button' },
    { id: 5, label: 'DPI Button',   fn: 'DPI Switch' },
  ],
  macros: [
    { id: 'm1', name: 'Quick Scope', events: [
      { type: 'keydown', key: 'RMB' },
      { type: 'delay', ms: 80 },
      { type: 'keydown', key: 'LMB' },
      { type: 'delay', ms: 30 },
      { type: 'keyup', key: 'LMB' },
      { type: 'keyup', key: 'RMB' },
    ]},
  ],
  activeMacroId: 'm1',
  battery: { level: 78, charging: true },

  loadFromDevice: (snap) => set(snap),
  updateBattery: (b) => set({ battery: b }),
  setActiveDpi: (i) => set({ activeDpi: i }),
  setSelectedStageIdx: (i) => set({ selectedStageIdx: i }),
  setDpiStageValue: (i, v) => set(s => {
    const stages = [...s.dpiStages]; stages[i] = { ...stages[i], value: v }; return { dpiStages: stages }
  }),
  setDpiStageColor: (i, c) => set(s => {
    const stages = [...s.dpiStages]; stages[i] = { ...stages[i], color: c }; return { dpiStages: stages }
  }),
  addDpiStage: () => set(s => {
    if (s.dpiStages.length >= 8) return s
    const color = STAGE_COLORS[s.dpiStages.length % STAGE_COLORS.length]
    return { dpiStages: [...s.dpiStages, { id: `s${Date.now()}`, value: 800, color }] }
  }),
  removeDpiStage: (i) => set(s => {
    if (s.dpiStages.length <= 1) return s
    const stages = s.dpiStages.filter((_, idx) => idx !== i)
    return { dpiStages: stages, activeDpi: Math.min(s.activeDpi, stages.length - 1), selectedStageIdx: Math.min(s.selectedStageIdx, stages.length - 1) }
  }),
  setLightMode: (i) => set({ lightMode: i }),
  setLightColor: (c) => set({ lightColor: c }),
  setBrightness: (v) => set({ brightness: v }),
  setLightSpeed: (v) => set({ lightSpeed: v }),
  setReportRate: (r) => set({ reportRate: r }),
  setMotionSync: (v) => set({ motionSync: v }),
  setRipple: (v) => set({ ripple: v }),
  setLongRange: (v) => set({ longRange: v }),
  setSleepTime: (t) => set({ sleepTime: t }),
  setLod: (l) => set({ lod: l }),
  setDebounce: (ms) => set({ debounce: ms }),
  setAngleSnap: (v) => set({ angleSnap: v }),
  setButtonFn: (id, fn) => set(s => ({ buttonMap: s.buttonMap.map(b => b.id === id ? { ...b, fn } : b) })),
  addMacro: () => set(s => {
    const id = `m${Date.now()}`
    return { macros: [...s.macros, { id, name: `Macro ${s.macros.length + 1}`, events: [] }], activeMacroId: id }
  }),
  deleteMacro: (id) => set(s => {
    const macros = s.macros.filter(m => m.id !== id)
    return { macros, activeMacroId: macros[0]?.id ?? null }
  }),
  renameMacro: (id, name) => set(s => ({ macros: s.macros.map(m => m.id === id ? { ...m, name } : m) })),
  setActiveMacro: (id) => set({ activeMacroId: id }),
  addMacroEvent: (macroId, event) => set(s => ({
    macros: s.macros.map(m => m.id === macroId ? { ...m, events: [...m.events, event] } : m)
  })),
  removeMacroEvent: (macroId, idx) => set(s => ({
    macros: s.macros.map(m => m.id === macroId ? { ...m, events: m.events.filter((_, i) => i !== idx) } : m)
  })),
}))

export { STAGE_COLORS }
