'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import { fmt, signalColor, SECTORS, timeAgo } from '../../lib/utils'
import { Card, CardTitle, SignalBadge, Stat } from '../../components/ui'
import { useUser } from '../../hooks/useUser'
import { featuresForRole, PLAN_INFO, ROLE_RANK, FEATURES } from '../../lib/planFeatures'
import { createClient } from '../../lib/supabase'

function Skeleton({ className, style }) {
  return <div className={`animate-pulse bg-white/5 rounded ${className || ''}`} style={style} />
}

function SkeletonCard({ children, className }) {
  return <Card className={className}>
    <div className="space-y-3">
      {children}
    </div>
  </Card>
}

export default function DashboardPage() {
  const router = useRouter()
  const { role, isDev, user, profile } = useUser()
  const [signals, setSignals] = useState(null)
  const [signalsLoading, setSignalsLoading] = useState(true)
  const [sectors, setSectors] = useState(null)
  const [sectorsLoading, setSectorsLoading] = useState(true)
  const [perf, setPerf] = useState(null)
  const [perfLoading, setPerfLoading] = useState(true)
  const [fii, setFii] = useState(null)
  const [fiiLoading, setFiiLoading] = useState(true)
  const [recent, setRecent] = useState([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [dbRole, setDbRole] = useState(null)

  useEffect(() => {
    api.tradeableSignals().then(r => setSignals(r?.data)).catch(() => {}).finally(() => setSignalsLoading(false))
    api.sectorRanking().then(r => setSectors(r?.data?.slice(0, 5))).catch(() => {}).finally(() => setSectorsLoading(false))
    api.performance().then(r => setPerf(r?.data)).catch(() => {}).finally(() => setPerfLoading(false))
    api.fiiDii().then(r => setFii(r?.data)).catch(() => {}).finally(() => setFiiLoading(false))
    api.recentHistory().then(r => setRecent(r?.data?.slice(0, 5) || [])).catch(() => {}).finally(() => setRecentLoading(false))

    ;(async () => {
      try {
        const sb = createClient()
        const { data: sess } = await sb.auth.getSession()
        if (!sess?.session?.user?.id) { setDbRole('NO SESSION'); return }
        const { data } = await sb
          .from('profiles')
          .select('email,role')
          .eq('id', sess.session.user.id)
          .maybeSingle()
        setDbRole(data?.role || 'NO ROW')
      } catch (e) { setDbRole('ERR: ' + e.message) }
    })()
  }, [])

  const tradeableList = signals ? Object.entries(signals).slice(0, 8) : []
  const planInfo = PLAN_INFO[role] || PLAN_INFO.free
  const unlocked = featuresForRole(role)
  const locked = isDev ? [] : FEATURES.filter(f => !unlocked.includes(f))
  const planRank = ROLE_RANK[role] || 0

  return (
    <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      <div className="mb-5">
        <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase mb-1">Market Intelligence</p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
      </div>

      {/* Plan card */}
      <Card className="mb-4" style={{ borderColor: planInfo.color + '40' }}>
        <div className="mb-3 p-2 rounded bg-bg-3/50 border border-amber-500/30 text-[10px] font-mono flex flex-wrap gap-3">
          <span className="text-amber-400">DEBUG</span>
          <span>useUser.role = <b className={isDev ? 'text-brand-red' : 'text-accent'}>{role || 'null'}</b></span>
          <span>isDev = <b>{String(isDev)}</b></span>
          <span>Supabase DB role = <b className={dbRole === 'developer' ? 'text-brand-red' : 'text-amber-300'}>{dbRole ?? 'loading\u2026'}</b></span>
          <span>profile.role = <b>{profile?.role ?? 'null'}</b></span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[9px] font-bold tracking-[2px] uppercase text-slate-500 mb-1">Your Plan</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-black" style={{ color: planInfo.color }}>{planInfo.name}</span>
              <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded border border-white/10">{planInfo.badge}</span>
              {isDev && (
                <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-brand-red/15 text-brand-red border border-brand-red/30">
                  All limits bypassed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-1">{planInfo.blurb}</div>
            <div className="text-[10px] text-slate-500 mt-2">
              <span className="text-white font-mono">{unlocked.length}</span> features unlocked
              {locked.length > 0 && <> \u00b7 <span className="text-slate-400">{locked.length}</span> locked</>}
              {' '}\u00b7 tier rank <span className="text-accent font-mono">{planRank}/3</span>
            </div>
          </div>
          {user && (
            <div className="text-right text-[10px] text-slate-500 font-mono">{user.email}</div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {unlocked.slice(0, 14).map(f => (
            <span key={f.key} className="text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded border"
              style={{ color: planInfo.color, borderColor: planInfo.color + '40', background: planInfo.color + '0a' }}>
              {f.icon} {f.label}
            </span>
          ))}
          {unlocked.length > 14 && (
            <span className="text-[9px] font-bold text-slate-500 px-2 py-1">+{unlocked.length - 14} more</span>
          )}
        </div>
        {locked.length > 0 && (
          <details className="mt-3">
            <summary className="text-[10px] font-bold tracking-wider uppercase text-slate-500 cursor-pointer hover:text-slate-300 list-none flex items-center gap-1">
              <span>{'\ud83d\udd12'}</span> {locked.length} locked features (upgrade to unlock)
            </summary>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {locked.map(f => {
                const tierColor = PLAN_INFO[f.plan]?.color || '#9ca3af'
                return (
                  <span key={f.key} className="text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded border border-white/5 text-slate-500 bg-bg-3/50"
                    title={`Requires ${PLAN_INFO[f.plan]?.name || f.plan}`}>
                    <span className="opacity-50">{f.icon}</span> {f.label}
                    <span className="ml-1 text-[8px]" style={{ color: tierColor }}> \u00b7 {f.plan}</span>
                  </span>
                )
              })}
            </div>
          </details>
        )}
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Model Accuracy', value: '68%', color: '#00e676', loading: false },
          { label: 'Profit Factor', value: '6.33x', color: '#00c8f0', loading: false },
          { label: 'Tradeable Now', value: String(tradeableList.length), color: '#ffc930', loading: signalsLoading },
          { label: 'FII Signal', value: fii?.market_flow_signal || '\u2014', color: fii?.fii_sentiment > 0 ? '#00e676' : fii?.fii_sentiment < 0 ? '#ff3355' : '#8899b4', loading: fiiLoading },
        ].map(({ label, value, color, loading }) => (
          <Card key={label} className="py-4 text-center">
            <div className="text-[9px] font-bold tracking-[2px] uppercase text-slate-500 mb-2">{label}</div>
            {loading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <div className="font-mono text-2xl font-bold" style={{ color }}>{value}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
        {/* Tradeable signals */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-3">
              <CardTitle>High Confidence Signals</CardTitle>
              <button onClick={() => router.push('/dashboard/predict')}
                className="text-[10px] font-bold text-accent hover:underline tracking-wider">
                View All \u2192
              </button>
            </div>
            {signalsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-14" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : tradeableList.length === 0 ? (
              <div className="text-slate-500 text-xs py-4">
                No tradeable signals. Run background_job.py to generate signals.
              </div>
            ) : tradeableList.map(([ticker, d]) => (
              <button key={ticker} onClick={() => router.push('/dashboard/predict')}
                className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/3 px-1 rounded-lg transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0"
                    style={{ background: signalColor(d.signal) + '12', border: `1px solid ${signalColor(d.signal)}25`, color: signalColor(d.signal) }}>
                    {ticker.replace('.NS', '').slice(0, 4)}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">{ticker.replace('.NS', '')}</div>
                    <div className="text-[10px] text-slate-500">{SECTORS[d.sector_code] || 'NSE'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SignalBadge signal={d.signal} size="xs" />
                  <div className="text-right">
                    <div className="font-mono text-xs text-accent font-semibold">{fmt(d.confidence)}%</div>
                    <div className="text-[9px] text-slate-600">confidence</div>
                  </div>
                </div>
              </button>
            ))}
          </Card>
        </div>

        {/* Sector ranking */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <CardTitle>Sector Strength</CardTitle>
            <button onClick={() => router.push('/dashboard/sectors')}
              className="text-[10px] font-bold text-accent hover:underline tracking-wider">
              All \u2192
            </button>
          </div>
          {sectorsLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
                <Skeleton className="w-4 h-3 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                </div>
                <Skeleton className="h-3 w-8 shrink-0" />
              </div>
            ))
          ) : sectors ? sectors.map((s, i) => (
            <div key={s.sector_name} className="flex items-center gap-2.5 py-2 border-b border-white/5 last:border-0">
              <div className="font-mono text-[10px] text-slate-600 w-4 flex-shrink-0">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold truncate">{s.sector_name}</span>
                  <span className="text-[10px] font-bold ml-2 flex-shrink-0"
                    style={{ color: s.outlook === 'BULLISH' ? '#00e676' : s.outlook === 'BEARISH' ? '#ff3355' : '#8899b4' }}>
                    {s.outlook}
                  </span>
                </div>
                <div className="h-1 bg-bg-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.buy_ratio}%`, background: '#00e676' }} />
                </div>
              </div>
              <div className="font-mono text-[10px] text-slate-500 w-8 text-right flex-shrink-0">
                {fmt(s.avg_confidence, 0)}%
              </div>
            </div>
          )) : (
            <div className="text-slate-600 text-xs">No sector data available</div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* FII */}
        <Card>
          <CardTitle>FII / DII Flow</CardTitle>
          {fiiLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : fii ? (
            <div className="grid grid-cols-2 gap-4">
              <Stat label="FII Today" value={'\u20b9' + fmt(fii.fii_net_today, 0) + 'cr'}
                color={fii.fii_net_today > 0 ? '#00e676' : '#ff3355'} size="sm" />
              <Stat label="DII Today" value={'\u20b9' + fmt(fii.dii_net_today, 0) + 'cr'}
                color={fii.dii_net_today > 0 ? '#00e676' : '#ff3355'} size="sm" />
              <Stat label="5d Avg" value={'\u20b9' + fmt(fii.fii_5d_avg, 0) + 'cr'}
                color={fii.fii_5d_avg > 0 ? '#00e676' : '#ff3355'} size="sm" />
              <Stat label="Signal" value={fii.market_flow_signal}
                color={fii.fii_sentiment > 0 ? '#00e676' : fii.fii_sentiment < 0 ? '#ff3355' : '#8899b4'} size="sm" />
            </div>
          ) : (
            <div className="text-slate-600 text-xs">FII data unavailable</div>
          )}
        </Card>

        {/* Performance */}
        <Card>
          <CardTitle>Model Performance</CardTitle>
          {perfLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Stat label="Accuracy" value="68%" color="#00e676" size="sm" />
              <Stat label="Win Rate" value="60%" color="#00e676" size="sm" />
              <Stat label="Profit Factor" value="6.33x" color="#00c8f0" size="sm" />
              <Stat label="Max DD" value="-6.76%" color="#ff3355" size="sm" />
            </div>
          )}
          {perf && (
            <div className="mt-3 bg-bg-3 rounded-lg px-3 py-2 text-[10px] text-slate-500">
              Total predictions: <span className="text-white font-mono">{perf.total_predictions}</span>
              {' \u00b7 '}Avg conf: <span className="text-accent font-mono">{fmt(perf.avg_confidence)}%</span>
            </div>
          )}
        </Card>

        {/* Recent history */}
        <Card>
          <div className="flex justify-between items-center mb-3">
            <CardTitle>Recent Predictions</CardTitle>
            <button onClick={() => router.push('/dashboard/history')}
              className="text-[10px] font-bold text-accent hover:underline tracking-wider">
              All \u2192
            </button>
          </div>
          {recentLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-2 w-10" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <Skeleton className="h-3 w-10 ml-auto" />
                  <Skeleton className="h-2 w-8 ml-auto" />
                </div>
              </div>
            ))
          ) : recent.length === 0 ? (
            <div className="text-slate-600 text-xs">No predictions yet</div>
          ) : recent.map((h, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[8px] font-bold flex-shrink-0"
                  style={{ background: signalColor(h.signal) + '12', color: signalColor(h.signal) }}>
                  {h.ticker?.replace('.NS', '').slice(0, 3)}
                </div>
                <div>
                  <div className="text-xs font-bold">{h.ticker?.replace('.NS', '')}</div>
                  <SignalBadge signal={h.signal} size="xs" />
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] text-slate-400">{fmt(h.confidence)}%</div>
                <div className="text-[9px] text-slate-600">{timeAgo(h.timestamp)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
