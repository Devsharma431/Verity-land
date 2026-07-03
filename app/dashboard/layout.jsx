'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '../../lib/supabase'
import { useUser } from '../../hooks/useUser'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import RefreshStatusBadge from '../../components/RefreshStatusBadge'
import UpdateToast from '../../components/UpdateToast'

function CheckUpdateBtn({ variant }) {
  const [status, setStatus] = useState(null)
  const [checking, setChecking] = useState(false)

  const handleCheck = async () => {
    setChecking(true)
    setStatus(null)
    try {
      const { checkUpdate } = await import('@tauri-apps/plugin-updater')
      const update = await checkUpdate()
      if (update?.available) {
        setStatus({ type: 'available', version: update.version })
      } else {
        setStatus({ type: 'uptodate' })
      }
    } catch {
      setStatus({ type: 'error' })
    }
    setChecking(false)
  }

  if (variant === 'nav') {
    return (
      <div className="mb-1">
        <button onClick={handleCheck} disabled={checking}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border border-transparent
            ${checking ? 'text-accent bg-accent/10 border-accent/20' : status?.type === 'uptodate' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : status?.type === 'available' ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}
          `}>
          <span className="text-base opacity-80">↻</span>
          <span className="flex-1 text-left">
            {checking ? 'Checking...' : status?.type === 'uptodate' ? 'Your app is up to date' : status?.type === 'available' ? `Update to ${status.version}` : 'Check Updates'}
          </span>
          {status?.type === 'available' && <span className="text-[9px] font-bold bg-brand-cyan/20 px-1.5 py-0.5 rounded">NEW</span>}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/5">
      <button onClick={handleCheck} disabled={checking}
        className="w-full text-[9px] font-mono font-bold tracking-wider text-slate-500 hover:text-accent transition-colors py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-40">
        {checking ? 'Checking...' : 'Check Updates'}
      </button>
      {status && (
        <div className={`text-[9px] text-center mt-1 font-mono ${
          status.type === 'uptodate' ? 'text-emerald-400' :
          status.type === 'available' ? 'text-brand-cyan' : 'text-red-400'
        }`}>
          {status.type === 'uptodate' && 'Your app is up to date'}
          {status.type === 'available' && `Update to ${status.version} available`}
          {status.type === 'error' && 'Check failed'}
        </div>
      )}
    </div>
  )
}

const LockedFeature = ({ label, icon, onClick }) => {
  const [popupOpen, setPopupOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          opacity: 0.6,
          filter: 'blur(4px)',
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          padding: '3px 2.5px',
          borderRadius: 'xl',
          marginBottom: 1
        }}
      >
        <span className="text-base opacity-80">{icon}</span>
        <span>{label}</span>
      </div>

      {popupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-bg-3/80 border border-white/10 rounded-xl p-6 space-y-4 text-center max-w-md w-full">
            <div style={{ fontSize: 24 }}>≡ƒöÆ</div>
            <div className="font-semibold text-white">Feature Locked</div>
            <div className="text-slate-400">
              This feature is available on higher plans. Please upgrade to access.
            </div>
            <Link 
              href="/pricing" 
              className="w-full bg-accent text-black font-bold px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors"
            >
              Upgrade Plan
            </Link>
            <button 
              onClick={() => setPopupOpen(false)}
              className="w-full text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-lg border border-white/10 bg-transparent hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: 'Γûú' },
  { path: '/dashboard/predict', label: 'Predict', icon: 'Γùê' },
  { path: '/dashboard/watchlist', label: 'Watchlist', icon: 'ΓùÄ' },
  { path: '/dashboard/compare', label: 'Compare', icon: 'Γè₧' },
  { path: '/dashboard/sectors', label: 'Sectors', icon: 'Γù½' },
  { path: '/dashboard/backtest', label: 'Backtest', icon: 'Γù╖' },
  { path: '/dashboard/history', label: 'History', icon: 'Γù┤' },
  { path: null, label: 'Check Updates', icon: 'Γå╗', action: 'checkUpdates' },
  { path: '/dashboard/settings', label: 'Settings', icon: 'ΓÜÖ' },
  { path: '/dashboard/portfolio', label: 'Portfolio', icon: 'Γèƒ', enterpriseOnly: true },
  { path: '/dashboard/market', label: 'FII / DII', icon: 'Γé╣', enterpriseOnly: true },
  { path: '/dashboard/paper', label: 'Paper Trade', icon: 'Γûú', enterpriseOnly: true },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: 'Γîÿ', enterpriseOnly: true },
  { path: '/dashboard/alerts', label: 'Alerts', icon: 'Γùö', enterpriseOnly: true },
  { path: '/dashboard/admin', label: 'Admin', icon: 'Γùë', devOnly: true },
  { path: '/dashboard/dev', label: 'Dev Panel', icon: 'ΓÜÖ', devOnly: true },
]

const ROLE_COLOR = {
  free: '#9ca3af',
  pro: '#00c8f0',
  enterprise: '#ffc930',
  developer: '#ff3355',
}

const TICKERS = [
  { name: 'TCS', change: '+2.4%', up: true },
  { name: 'RELIANCE', change: '-0.8%', up: false },
  { name: 'HDFC', change: '+1.2%', up: true },
  { name: 'INFY', change: '+0.6%', up: true },
  { name: 'TATASTEEL', change: '-1.4%', up: false },
  { name: 'SUNPHARMA', change: '+3.1%', up: true },
  { name: 'MARUTI', change: '+0.9%', up: true },
  { name: 'WIPRO', change: '-0.3%', up: false },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, text: 'Market Closed' })
  const [backendReady, setBackendReady] = useState(false)
  const [trainingPopup, setTrainingPopup] = useState('')
  const redirectingRef = useRef(false)
  const { role, isDev, isEnterprise } = useUser()

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null)
      setAuthChecked(true)
    }).catch(() => {
      setAuthChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT' && !redirectingRef.current) {
          redirectingRef.current = true
          window.location.href = '/login'
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    let cancelled = false
    let retries = 0
    const MAX_RETRIES = 20
    const check = () => {
      if (retries >= MAX_RETRIES) { setBackendReady(true); return }
      retries++
      fetch(`${API}/health`)
        .then(r => { if (r.ok && !cancelled) setBackendReady(true) })
        .catch(() => { if (!cancelled) setTimeout(check, 800) })
    }
    check()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!authChecked) {
        window.location.reload()
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [authChecked])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.relative')) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Update market status every minute
  useEffect(() => {
    const updateMarketStatus = () => {
      const now = new Date()
      // Convert to IST (UTC+5:30)
      const istOffset = 5.5 * 60 * 60 * 1000 // 5.5 hours in ms
      const istTime = new Date(now.getTime() + istOffset)
      const hours = istTime.getUTCHours() // Actually getHours gives local time; we added offset so getHours is IST
      const minutes = istTime.getUTCMinutes()
      const totalMinutes = hours * 60 + minutes
      const marketOpen = totalMinutes >= 9 * 60 + 15 && totalMinutes <= 15 * 60 + 30
      setMarketStatus({
        isOpen: marketOpen,
        text: marketOpen ? 'Market Open' : 'Market Closed',
      })
    }
    updateMarketStatus()
    const interval = setInterval(updateMarketStatus, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSignout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="font-mono text-xs text-slate-500 tracking-widest uppercase animate-pulse">
          Authenticating...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Scanline */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent pointer-events-none z-50 animate-scan hidden md:block" />

      {/* Grid */}
      <div className="fixed inset-0 bg-grid bg-[size:48px_48px] pointer-events-none z-0" />

      {/* Ticker tape - hidden on mobile */}
      <div className="relative z-20 h-8 bg-bg-2 border-b border-white/5 overflow-hidden flex items-center flex-shrink-0 hidden sm:block">
        <div className="flex gap-12 whitespace-nowrap animate-ticker pl-4">
          {[...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="font-mono text-[10px] flex gap-2">
              <span className="text-slate-500">{t.name}</span>
              <span className={t.up ? 'text-brand-green' : 'text-brand-red'}>{t.up ? 'Γû▓' : 'Γû╝'} {t.change}</span>
            </span>
          ))}
        </div>
      </div>

{/* Header */}
        <header className="relative z-20 h-12 flex-shrink-0 glass-strong border-b border-white/5 flex items-center justify-between px-3 md:px-5">
         <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => {
              if (window.innerWidth < 768) {
                setMobileMenuOpen(!mobileMenuOpen)
              } else {
                setSidebarOpen(!sidebarOpen)
              }
              setUserMenuOpen(false);
            }}
             className="text-slate-400 hover:text-white transition-colors text-xl font-mono w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5">
             Γëí
           </button>
           <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
               <img src="/logo.jpg" alt="Q" className="w-full h-full object-contain" />
             </div>
             <span className="font-black tracking-tight text-base hidden sm:inline">Verity</span>
           </Link>
             {!backendReady ? (
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                 <span className="font-mono text-[9px] text-brand-cyan uppercase tracking-wider whitespace-nowrap">Training</span>
               </div>
             ) : (
               <div className="hidden lg:flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                 <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">Live</span>
               </div>
             )}
            {/* Market status */}
            <div className="hidden lg:flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${marketStatus.isOpen ? 'bg-brand-green' : 'bg-brand-red'} animate-pulse`} />
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider">{marketStatus.text}</span>
            </div>
         </div>
         <div className="flex items-center gap-2 md:gap-4">
           <ThemeToggle className="scale-90 md:scale-100" />
           {isDev ? (
             <span
               className="text-[9px] font-black tracking-widest uppercase px-1.5 md:px-2 py-1 rounded-full border hidden lg:inline-flex items-center gap-1"
               style={{
                 color: '#ff3355',
                 borderColor: 'rgba(255,51,85,0.4)',
                 background: 'rgba(255,51,85,0.1)',
               }}
               title="Developer role ΓÇö all plan limits bypassed">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-pulse" />
               <span className="hidden xl:inline">All Access Unlocked</span>
             </span>
           ) : (
             <Link href="/pricing" className="text-xs font-semibold text-slate-400 hover:text-accent transition-colors hidden md:block">
               Upgrade
             </Link>
           )}
           {user && role && (
             <span
               className="text-[9px] font-black tracking-widest uppercase px-1.5 md:px-2 py-1 rounded-full border hidden md:inline-block"
               style={{
                 color: ROLE_COLOR[role] || ROLE_COLOR.free,
                 borderColor: (ROLE_COLOR[role] || ROLE_COLOR.free) + '40',
                 background: (ROLE_COLOR[role] || ROLE_COLOR.free) + '15',
               }}
             >
               {role}
             </span>
           )}
            {user && (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-purple-500/30 flex items-center justify-center p-1 hover:bg-white/5 transition-colors">
                  {user.email?.[0]?.toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-bg-3/80 border border-white/10 rounded-xl z-30 flex flex-col items-start p-3 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-accent">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium">{user.email}</span>
                        <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full"
                          style={{
                            color: ROLE_COLOR[role] || ROLE_COLOR.free,
                            borderColor: (ROLE_COLOR[role] || ROLE_COLOR.free) + '40',
                            background: (ROLE_COLOR[role] || ROLE_COLOR.free) + '15',
                          }}>
                            {role}
                        </span>
                      </div>
                    </div>
                    <button onClick={handleSignout}
                      className="w-full text-left text-xs text-slate-500 hover:text-red-400 transition-colors px-3 py-2 rounded hover:bg-white/5">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
         </div>
       </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

         {/* Sidebar - responsive */}
         <aside className={`
           flex-shrink-0 transition-all duration-300 overflow-hidden
           bg-bg-2 border-r border-white/5 flex flex-col
           fixed md:relative inset-y-0 left-0 top-14 h-[calc(100vh-3.5rem)] z-40
           ${(sidebarOpen || mobileMenuOpen) ? 'w-52' : 'w-0'}
           ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
         `}>
          <nav className="p-3 flex-1 pt-4 overflow-y-auto min-h-0">
            {NAV.map(({ path, label, icon, action, devOnly, enterpriseOnly, locked }) => {
              const hasAccess = (!devOnly || isDev) && (!enterpriseOnly || isEnterprise) && (!locked || isDev);
              
              if (!hasAccess) {
                return (
                  <LockedFeature key={label} label={label} icon={icon} />
                );
              }

              if (action === 'checkUpdates') {
                return <CheckUpdateBtn key="checkUpdates" variant="nav" />;
              }
              
              const active = pathname === path;
              const restricted = !backendReady && (path === '/dashboard' || path === '/dashboard/sectors')
              return (
                <Link key={path} href={restricted ? '#' : path}
                  onClick={(e) => {
                    if (restricted) {
                      e.preventDefault()
                      setTrainingPopup(label)
                      setTimeout(() => setTrainingPopup(''), 4000)
                      return
                    }
                    setMobileMenuOpen(false);
                    setSidebarOpen(false);
                    setUserMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all ${
                    restricted
                      ? 'text-brand-cyan/70 hover:text-brand-cyan hover:bg-brand-cyan/5 border border-dashed border-brand-cyan/20'
                      : active
                        ? devOnly
                          ? 'bg-brand-red/10 text-brand-red border border-brand-red/20'
                          : 'bg-accent/10 text-accent border border-accent/20'
                        : devOnly
                          ? 'text-brand-red/80 hover:text-brand-red hover:bg-brand-red/5 border border-transparent'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}>
                  <span className="text-base opacity-80">{icon}</span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Model info box - hidden on small sidebar */}
          <div className="m-3 p-4 bg-accent/5 border border-accent/10 rounded-xl hidden lg:block">
            <div className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-3">AI Model</div>
            {[
              { label: 'Accuracy', value: '68%' },
              { label: 'PF', value: '6.33x' },
              { label: 'Stocks', value: '50' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs mb-2">
                <span className="text-slate-500">{label}</span>
                <span className="font-mono text-accent font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main - responsive padding */}
        <main className="flex-1 overflow-auto p-3 md:p-4 lg:p-6 min-w-0">
          {children}
        </main>
      </div>
      <UpdateToast isBusy={false} />
      {trainingPopup && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs animate-fade-up">
          <div className="glass-strong border border-brand-cyan/20 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse mt-1 shrink-0" />
            <div>
              <p className="font-bold text-xs text-white">Model is in training</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Please wait for 10 min until we set up the Verity model for you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
