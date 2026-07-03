'use client'
import { useEffect, useState } from 'react'
import { api } from '../../../lib/api'
import { fmt } from '../../../lib/utils'
import { Card, CardTitle, Tag, Btn } from '../../../components/ui'
import { useUser } from '../../../hooks/useUser'
import { hasFeature } from '../../../lib/planFeatures'

function Skeleton({ className, style }) {
  return <div className={`animate-pulse bg-white/5 rounded ${className || ''}`} style={style} />
}

function SectorSkeleton() {
  return (
    <Card>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2.5 w-14" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-2.5 w-12" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-bg-3 rounded-lg p-2 text-center space-y-1">
              <Skeleton className="h-5 w-8 mx-auto" />
              <Skeleton className="h-2 w-10 mx-auto" />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-2.5 w-10" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-12" />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function SectorsPage() {
  const { role } = useUser()
  const canExportPDF = hasFeature(role, 'sector_reports_pdf')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.sectorRanking()
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const downloadPDF = async () => {
    try {
      const blob = await api.sectorsPDF()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stockai-sector-report-${new Date().toISOString().slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('PDF export failed: ' + e.message)
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
      <div className="mb-4 md:mb-5 flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-bold tracking-[3px] text-slate-500 uppercase mb-1">Market Breadth</p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight">Sector Rankings</h1>
        </div>
        {canExportPDF && (
          <Btn variant="outline" onClick={downloadPDF} size="sm">
            {'\u2398'} Download PDF Report
          </Btn>
        )}
      </div>

      {error ? (
        <Card className="mb-3 text-center py-12">
          <p className="text-brand-red text-xs">{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-3 text-[10px] font-bold text-accent hover:underline tracking-wider">
            Retry
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SectorSkeleton key={i} />)}
        </div>
      ) : !data?.length ? (
        <Card className="mb-3 text-center py-12 text-slate-500">
          Run background_job.py to generate sector rankings
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {data.map((s, i) => (
            <Card key={s.sector_name} style={{
              borderColor: s.outlook === 'BULLISH' ? 'rgba(0,230,118,0.2)' : s.outlook === 'BEARISH' ? 'rgba(255,51,85,0.2)' : undefined,
              animation: `fadeUp ${0.1 + i * 0.05}s ease forwards`
            }}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-bg-3 flex items-center justify-center font-mono text-xs font-bold text-slate-400">
                    #{i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{s.sector_name}</div>
                    <div className="text-[10px] text-slate-500">{s.total_stocks} stocks</div>
                  </div>
                </div>
                <Tag color={s.outlook === 'BULLISH' ? '#00e676' : s.outlook === 'BEARISH' ? '#ff3355' : '#8899b4'}>
                  {s.outlook}
                </Tag>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                  <span className="tracking-wider uppercase">Sector Score</span>
                  <span className="font-mono text-accent font-semibold">{fmt(s.sector_score, 0)}/100</span>
                </div>
                <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(Math.max(s.sector_score, 0), 100)}%`,
                      background: s.outlook === 'BULLISH' ? '#00e676' : s.outlook === 'BEARISH' ? '#ff3355' : '#ffc930'
                    }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'BUY', value: s.buy_count, color: '#00e676' },
                  { label: 'SELL', value: s.sell_count, color: '#ff3355' },
                  { label: 'HOLD', value: s.hold_count, color: '#ffc930' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-bg-3 rounded-lg p-2 text-center">
                    <div className="font-mono font-bold text-lg" style={{ color }}>{value}</div>
                    <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[11px] mb-3">
                <span className="text-slate-500">Avg Confidence</span>
                <span className="font-mono text-accent">{fmt(s.avg_confidence, 0)}%</span>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {s.stocks?.slice(0, 5).map(t => (
                  <span key={t} className="font-mono text-[9px] text-slate-600 bg-bg-3 px-2 py-0.5 rounded">
                    {t.replace('.NS', '')}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
