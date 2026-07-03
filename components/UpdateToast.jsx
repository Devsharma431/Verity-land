'use client'
import { useState, useEffect } from 'react'

export default function UpdateToast({ isBusy }) {
  const [update, setUpdate] = useState(null)
  const [installing, setInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const { checkUpdate } = await import('@tauri-apps/plugin-updater')
        const result = await checkUpdate()
        if (result?.available) setUpdate(result)
      } catch {}
    })()
  }, [])

  if (!update || dismissed || installing) return null

  const handleInstall = async () => {
    setInstalling(true)
    try {
      const { installUpdate } = await import('@tauri-apps/plugin-updater')
      await installUpdate()
    } catch {}
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs animate-fade-up">
      <div className="glass-strong border border-brand-cyan/20 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3">
        <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white">Update {update.version} available</p>
          <p className="text-[10px] text-slate-400 mt-0.5">A new version is ready to install.</p>
          <div className="flex gap-2 mt-2">
            <button onClick={handleInstall}
              className="text-[9px] font-bold bg-brand-cyan text-brand-darker px-2.5 py-1 rounded-lg hover:brightness-110 transition-all">
              Update & Restart
            </button>
            <button onClick={() => setDismissed(true)}
              className="text-[9px] text-slate-500 hover:text-white px-2 py-1 transition-all">
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
