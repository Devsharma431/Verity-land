'use client'
import { cn, fmt, signalColor, signalBg, confidenceColor, altmanColor } from '../../lib/utils'
export { ThemeToggle, ThemeProvider, useTheme } from './ThemeToggle'
export { LogoLoader, PageLoader, InlineLoader } from './LogoLoader'

export function Card({ children, className, glow }) {
  return (
    <div className={cn(
      'card rounded-2xl p-5 transition-all duration-200',
      glow && 'animate-border-glow',
      className
    )}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <div className={cn('text-[9px] font-bold tracking-[2.5px] uppercase text-slate-500 mb-3', className)}>
      {children}
    </div>
  )
}

export function Spinner({ size = 32 }) {
  return (
    <div style={{ width: size, height: size }}
      className="border-2 border-white/10 border-t-accent rounded-full animate-spin" />
  )
}

export function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Spinner />
      <span className="text-[10px] font-bold tracking-[2px] uppercase text-slate-500">{text}</span>
    </div>
  )
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-red-500/6 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm flex gap-2 items-start">
      <span className="flex-shrink-0">ΓÜá</span>
      <span>{message}</span>
    </div>
  )
}

export function SignalBadge({ signal, size = 'md' }) {
  const sizes = {
    xs: 'text-[9px] px-2 py-0.5',
    sm: 'text-[11px] px-3 py-1',
    md: 'text-sm px-4 py-1.5',
    lg: 'text-xl px-5 py-2',
    xl: 'text-4xl px-6 py-3 tracking-tight',
  }
  return (
    <span className={cn('font-black rounded-xl border inline-block font-sans', sizes[size])}
      style={{ color: signalColor(signal), background: signalBg(signal), borderColor: signalColor(signal) + '40' }}>
      {signal}
    </span>
  )
}

export function ConfidenceBar({ value }) {
  const color = confidenceColor(value)
  return (
    <div>
      <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
        <span className="tracking-wider uppercase">Confidence</span>
        <span className="font-mono font-semibold" style={{ color }}>{fmt(value)}%</span>
      </div>
      <div className="h-1.5 bg-bg-3 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  )
}

export function ProbBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="font-mono text-[10px] font-bold w-9" style={{ color }}>{label}</span>
      <div className="flex-1 h-1 bg-bg-3 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] text-slate-500 w-10 text-right">{fmt(value)}%</span>
    </div>
  )
}

export function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', className }) {
  const variants = {
    primary: 'bg-accent text-black hover:bg-accent/90',
    outline: 'bg-transparent text-accent border border-accent hover:bg-accent/8',
    ghost: 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10',
    danger: 'bg-transparent text-brand-red border border-brand-red hover:bg-brand-red/8',
  }
  const sizes = {
    sm: 'text-[11px] px-3.5 py-1.5',
    md: 'text-xs px-5 py-2.5',
    lg: 'text-sm px-7 py-3',
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn(
        'font-bold tracking-wider uppercase rounded-xl transition-all hover:-translate-y-0.5',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        variants[variant], sizes[size], className
      )}>
      {children}
    </button>
  )
}

export function Input({ value, onChange, placeholder, onKeyDown, className, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
      className={cn(
        'input font-mono text-sm px-4 py-2.5 rounded-xl',
        'placeholder:text-slate-600',
        className
      )} />
  )
}

export function Select({ value, onChange, options, className }) {
  return (
    <select value={value} onChange={onChange}
      className={cn('input text-xs px-4 py-2.5 rounded-xl cursor-pointer', className)}>
      {options.map(({ value: v, label }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  )
}

export function Tag({ children, color = '#00c8f0' }) {
  return (
    <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border inline-block"
      style={{ color, borderColor: color + '40', background: color + '15' }}>
      {children}
    </span>
  )
}

export function Stat({ label, value, color, size = 'md' }) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl', xl: 'text-4xl' }
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[9px] font-bold tracking-[2px] uppercase text-slate-500">{label}</div>
      <div className={cn('font-mono font-medium', sizes[size])} style={{ color: color || 'var(--fg)' }}>{value}</div>
    </div>
  )
}

export function ScoreRing({ score, size = 100 }) {
  const r = size / 2 - 7
  const c = 2 * Math.PI * r
  const filled = (Math.min(score, 100) / 100) * c
  const color = score >= 60 ? '#00e676' : score >= 40 ? '#ffc930' : '#ff3355'
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${filled} ${c - filled}`} strokeLinecap="round" />
      </svg>
      <span className="font-mono font-medium z-10 text-2xl" style={{ color }}>
        {Math.round(score)}
      </span>
    </div>
  )
}

export function SRBar({ support, resistance, distToSupport, distToResistance, riskReward }) {
  const pos = distToSupport && distToResistance
    ? (distToSupport / (distToSupport + distToResistance)) * 100
    : 50
  return (
    <div>
      <div className="relative h-7 bg-bg-3 rounded-lg overflow-hidden border border-white/6 my-3">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-green/10" />
        <div className="absolute top-0 h-full w-0.5 bg-accent shadow-[0_0_8px_rgba(0,200,240,0.6)] transition-all duration-700"
          style={{ left: `${pos}%`, transform: 'translateX(-50%)' }} />
        <span className="absolute left-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-500">
          S Γé╣{support ? Math.round(support) : 'ΓÇö'}
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] text-slate-500">
          R Γé╣{resistance ? Math.round(resistance) : 'ΓÇö'}
        </span>
      </div>
      <div className="flex justify-between text-[11px]">
        <span className="text-brand-red">Γåô {fmt(distToSupport)}%</span>
        <span className="font-mono" style={{ color: riskReward >= 1.5 ? '#00e676' : riskReward >= 1 ? '#ffc930' : '#ff3355' }}>
          R/R {fmt(riskReward)}
        </span>
        <span className="text-brand-green">Γåæ {fmt(distToResistance)}%</span>
      </div>
    </div>
  )
}

export function Divider() {
  return <div className="border-t border-white/6 my-4" />
}
