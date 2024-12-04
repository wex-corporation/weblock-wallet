import { create } from 'zustand'

interface LogEntry {
  method: string
  timestamp: Date
  request: any
  response: Record<string, unknown> | null
  error?: Error
}

interface LoggerStore {
  logs: LogEntry[]
  addLog: (data: Omit<LogEntry, 'timestamp'>) => void
  clearLogs: () => void
}

const useLoggerStore = create<LoggerStore>((set) => ({
  logs: [],
  addLog: (data) =>
    set((state) => ({
      logs: [...state.logs, { ...data, timestamp: new Date() }]
    })),
  clearLogs: () => set({ logs: [] })
}))

export const useRequestResponseLogger = () => {
  const { logs, addLog, clearLogs } = useLoggerStore()
  return { logs, addLog, clearLogs }
}
