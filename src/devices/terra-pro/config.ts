// Terra Pro (PMW3395) — 200–26000 DPI in 50 DPI increments
// Single-range config: driver formula = (eepromVal + 1) * step
export const TERRA_PRO_SENSOR_CFG = {
  range: [{ min: 200, step: 50 }],
} as const

export const TERRA_PRO_SENSOR_TYPE = '3950'   // not OM76 — uses standard formula
export const TERRA_PRO_KEYS_COUNT  = 6
export const TERRA_PRO_SUPPORT_LONG_DISTANCE  = true
export const TERRA_PRO_DEFAULT_LONG_DISTANCE  = false

// Empty filters: browser shows all HID devices.
// The driver filters internally for reportId = 0x08.
// Add { vendorId: 0x????, productId: 0x???? } here once VID/PID is confirmed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TERRA_PRO_HID_FILTERS: any[] = []
