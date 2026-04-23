import { create } from 'zustand'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
export type ConnectionType   = 'usb' | 'wireless' | null

interface ConnectionState {
  status: ConnectionStatus
  type: ConnectionType
  errorMessage: string | null
  isWired: boolean
  deviceVersion: string
  dongleVersion: string
}

interface ConnectionActions {
  setStatus: (s: ConnectionStatus) => void
  setConnected: (info: {
    type: ConnectionType
    isWired: boolean
    deviceVersion: string
    dongleVersion: string
  }) => void
  setError: (msg: string) => void
  reset: () => void
}

const INITIAL: ConnectionState = {
  status: 'disconnected',
  type: null,
  errorMessage: null,
  isWired: false,
  deviceVersion: '--',
  dongleVersion: '--',
}

export const useConnectionStore = create<ConnectionState & ConnectionActions>((set) => ({
  ...INITIAL,
  setStatus:   (s) => set({ status: s }),
  setConnected: (info) => set({ status: 'connected', ...info, errorMessage: null }),
  setError:    (msg) => set({ status: 'error', errorMessage: msg }),
  reset:       () => set(INITIAL),
}))
