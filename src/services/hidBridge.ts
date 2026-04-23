// @ts-ignore — HIDHandle.js is plain JS with no type declarations
import HIDHandle from '../driver/HIDHandle'
import { useDeviceStore } from '../store/deviceStore'
import { useConnectionStore } from '../store/connectionStore'
import {
  TERRA_PRO_SENSOR_CFG,
  TERRA_PRO_SENSOR_TYPE,
  TERRA_PRO_KEYS_COUNT,
  TERRA_PRO_SUPPORT_LONG_DISTANCE,
  TERRA_PRO_DEFAULT_LONG_DISTANCE,
  TERRA_PRO_HID_FILTERS,
} from '../devices/terra-pro/config'

// ── Light mode maps ────────────────────────────────────────────────────────────
// Driver: 0=off 1=rainbow 2=breathing 3=solid 4=neon 5=mixed-breathing 6=colorful-solid
// UI:     0=off 1=solid   2=breathing 3=rainbow 4=neon 5=wave
const DRIVER_TO_UI_LIGHT: Record<number, number> = { 0:0, 1:3, 2:2, 3:1, 4:4, 5:5, 6:1 }
const UI_TO_DRIVER_LIGHT: Record<number, number> = { 0:0, 1:3, 2:2, 3:1, 4:4, 5:5 }

// ── Colour helpers ─────────────────────────────────────────────────────────────
function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!m) return '#ff0000'
  return '#' + [m[1], m[2], m[3]].map(v => parseInt(v).toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgb(${r}, ${g}, ${b})`
}

// ── Debounce ───────────────────────────────────────────────────────────────────
function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

// ── Guard ──────────────────────────────────────────────────────────────────────
function isConnected() {
  return useConnectionStore.getState().status === 'connected'
}

// ── Sync driver state → Zustand store ─────────────────────────────────────────
function syncToStore() {
  const d   = HIDHandle.deviceInfo as any
  const cfg = d.mouseCfg
  const bat = d.battery

  const maxStages = Math.max(1, Math.min(cfg.maxDpiStage || 4, 8))
  const dpiStages = (cfg.dpis as any[]).slice(0, maxStages).map((stage: any, i: number) => ({
    id: `s${i}`,
    value: stage.value || 400,
    color: typeof stage.color === 'string' && stage.color.startsWith('rgb')
      ? rgbToHex(stage.color)
      : (stage.color || '#78BE1F'),
  }))

  const activeDpi    = Math.min(cfg.currentDpi ?? 0, dpiStages.length - 1)
  const uiLightMode  = DRIVER_TO_UI_LIGHT[cfg.lightEffect?.mode ?? 0] ?? 0
  const rawColor     = cfg.lightEffect?.color ?? 'rgb(120,190,31)'
  const lightColor   = typeof rawColor === 'string' && rawColor.startsWith('rgb')
    ? rgbToHex(rawColor)
    : rawColor

  useDeviceStore.getState().loadFromDevice({
    dpiStages,
    activeDpi,
    selectedStageIdx: activeDpi,
    lightMode:   uiLightMode,
    lightColor,
    brightness:  Math.min(cfg.lightEffect?.brightness ?? 3, 9),
    lightSpeed:  Math.min(cfg.lightEffect?.speed ?? 3, 9),
    reportRate:  cfg.reportRate ?? 1000,
    motionSync:  !!cfg.sensor?.motionSync,
    ripple:      !!cfg.sensor?.ripple,
    longRange:   !!cfg.longDistance,
    sleepTime:   cfg.sleepTime ?? 3,
    lod:         cfg.sensor?.lod ?? 1,
    debounce:    cfg.debounceTime ?? 8,
    angleSnap:   !!cfg.sensor?.angle,
    battery: { level: bat?.level ?? 0, charging: !!bat?.charging },
  })
}

// ── Init Terra Pro device config on the driver's deviceInfo ───────────────────
function initDeviceConfig() {
  const d = HIDHandle.deviceInfo as any
  d.mouseCfg.sensor.type = TERRA_PRO_SENSOR_TYPE
  d.mouseCfg.sensor.cfg  = { range: [...TERRA_PRO_SENSOR_CFG.range.map((r: any) => ({ ...r }))] }
  d.mouseCfg.keysCount   = TERRA_PRO_KEYS_COUNT
  d.mouseCfg.supportLongDistance  = TERRA_PRO_SUPPORT_LONG_DISTANCE
  d.mouseCfg.defaultLongDistance  = TERRA_PRO_DEFAULT_LONG_DISTANCE
}

// ── Subscription cleanup ───────────────────────────────────────────────────────
let unsubscribers: Array<() => void> = []
let batteryPollId: ReturnType<typeof setInterval> | null = null
let statusPollId:  ReturnType<typeof setInterval> | null = null

function cleanup() {
  unsubscribers.forEach(fn => fn())
  unsubscribers = []
  if (batteryPollId) { clearInterval(batteryPollId); batteryPollId = null }
  if (statusPollId)  { clearInterval(statusPollId);  statusPollId  = null }
}

// Per-field debounced write fns — created once per session
let dDpiValue:  (i: number, v: number) => void = () => {}
let dDpiColor:  (i: number, c: string) => void = () => {}
let dLightColor: (c: string) => void = () => {}

// ── Wire store changes → mouse writes ─────────────────────────────────────────
function setupSubscriptions() {
  dDpiValue  = debounce((i: number, v: number) => { HIDHandle.Set_MS_DPIValue(i, v) }, 400)
  dDpiColor  = debounce((i: number, c: string) => { HIDHandle.Set_MS_DPIColor(i, hexToRgb(c)) }, 400)
  dLightColor = debounce((c: string) => { HIDHandle.Set_MS_LightColor(hexToRgb(c)) }, 400)

  // Single subscriber — diff state vs previous state for every field we care about
  unsubscribers.push(
    useDeviceStore.subscribe((s, prev) => {
      if (!isConnected()) return

      // DPI stages — value, colour, count
      s.dpiStages.forEach((stage, i) => {
        const p = prev.dpiStages[i]
        if (!p) return
        if (stage.value !== p.value) dDpiValue(i, stage.value)
        if (stage.color !== p.color) dDpiColor(i, stage.color)
      })
      if (s.dpiStages.length !== prev.dpiStages.length) {
        HIDHandle.Set_MS_MaxDPI(s.dpiStages.length)
      }

      // Active DPI stage
      if (s.activeDpi !== prev.activeDpi) HIDHandle.Set_MS_CurrentDPI(s.activeDpi)

      // Report rate
      if (s.reportRate !== prev.reportRate) HIDHandle.Set_MS_ReportRate(s.reportRate)

      // Lighting
      if (s.lightMode !== prev.lightMode) HIDHandle.Set_MS_LightMode(UI_TO_DRIVER_LIGHT[s.lightMode] ?? 0)
      if (s.lightColor !== prev.lightColor) dLightColor(s.lightColor)
      if (s.brightness !== prev.brightness) HIDHandle.Set_MS_LightBrightness(s.brightness)
      if (s.lightSpeed !== prev.lightSpeed) HIDHandle.Set_MS_LightSpeed(s.lightSpeed)

      // Sensor settings
      if (s.motionSync !== prev.motionSync) HIDHandle.Set_MS_MotionSync(s.motionSync ? 1 : 0)
      if (s.ripple     !== prev.ripple)     HIDHandle.Set_MS_Ripple(s.ripple ? 1 : 0)
      if (s.angleSnap  !== prev.angleSnap)  HIDHandle.Set_MS_Angle(s.angleSnap ? 1 : 0)
      if (s.lod        !== prev.lod)        HIDHandle.Set_MS_LOD(s.lod)
      if (s.debounce   !== prev.debounce)   HIDHandle.Set_MS_DebounceTime(s.debounce)
      if (s.sleepTime  !== prev.sleepTime)  HIDHandle.Set_MS_LightOffTime(s.sleepTime)
      if (s.longRange  !== prev.longRange)  HIDHandle.Set_Device_LongDistance(s.longRange ? 1 : 0)
    })
  )

  // Battery poll — driver updates deviceInfo.battery internally every ~5s
  batteryPollId = setInterval(() => {
    if (!isConnected()) return
    const bat = (HIDHandle.deviceInfo as any).battery
    useDeviceStore.getState().updateBattery({ level: bat?.level ?? 0, charging: !!bat?.charging })
  }, 10_000)

  // Disconnect detection — driver sets deviceOpen=false on USB pull
  statusPollId = setInterval(() => {
    if (useConnectionStore.getState().status !== 'connected') return
    const d = HIDHandle.deviceInfo as any
    if (!d.deviceOpen) {
      cleanup()
      useConnectionStore.getState().reset()
    }
  }, 2_000)
}

// ── Public API ─────────────────────────────────────────────────────────────────
export const hidBridge = {
  async connect(type: 'usb' | 'wireless'): Promise<{ success: boolean; error?: string }> {
    const connStore = useConnectionStore.getState()
    connStore.setStatus('connecting')

    try {
      HIDHandle.Set_Visit_Mode(false)
      initDeviceConfig()

      const ok: boolean = await HIDHandle.Request_Device(TERRA_PRO_HID_FILTERS)
      if (!ok) {
        connStore.setStatus('disconnected')
        return { success: false, error: 'No device selected or device not recognised' }
      }

      // Device_Connect → Device_Connect → Read_Mouse_Flash → Update_Mouse_Info
      await HIDHandle.Device_Connect()

      syncToStore()

      const d = HIDHandle.deviceInfo as any
      connStore.setConnected({
        type,
        isWired:       !!d.isWired,
        deviceVersion: d.version?.device ?? '--',
        dongleVersion: d.version?.dongle ?? '--',
      })

      setupSubscriptions()
      return { success: true }
    } catch (err: any) {
      const msg = err?.message ?? String(err)
      connStore.setError(msg)
      return { success: false, error: msg }
    }
  },

  async disconnect() {
    cleanup()
    try { await HIDHandle.Device_Close() } catch (_) { /* ignore */ }
    useConnectionStore.getState().reset()
  },
}
