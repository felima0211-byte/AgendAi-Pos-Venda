'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // 1. cria a conta (já confirmada) no servidor
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Erro ao cadastrar')

      // 2. loga (grava a sessão no cookie do domínio)
      const supabase = createClient()
      const { error: e2 } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (e2) throw new Error('Conta criada. Faça login.')

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full flex flex-col gap-3 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6">
      <h2 className="text-base font-bold text-[var(--color-text-primary)]">Criar conta</h2>
      <input
        type="text" required value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome" autoComplete="name"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="E-mail" autoComplete="email"
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
      />
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha (mín. 8 caracteres)" autoComplete="new-password"
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--color-primary)]"
        />
        <button
          type="button" onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] active:scale-95"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="flex items-center justify-center gap-2 py-3 rounded-[var(--radius-full)] bg-[var(--color-primary)] text-white text-sm font-semibold disabled:opacity-60 active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar conta'}
      </button>
      <p className="text-[13px] text-center text-[var(--color-text-secondary)]">
        Já tem conta?{' '}
        <Link href="/sign-in" className="font-semibold text-[var(--color-primary)]">Entrar</Link>
      </p>
    </form>
  )
}
