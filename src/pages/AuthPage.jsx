import { useState } from 'react'
import SiteHeader from '../components/SiteHeader.jsx'

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  )
}

function AuthPage({ mode, message, isAuthenticated, onLogin, onNavigate, onSignup }) {
  const isSignup = mode === 'signup'
  const [form, setForm] = useState({ email: '', username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  
  // State tambahan untuk mengunci tombol agar tidak diklik berkali-kali saat request ke cloud sedang berjalan
  const [isPending, setIsPending] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsPending(true) // Aktifkan status loading backend

    try {
      if (isSignup) {
        await onSignup(form)
        return
      }

      await onLogin({
        identifier: form.email || form.username,
        password: form.password
      })
    } catch (err) {
      console.error("Autentikasi gagal:", err.message)
    } finally {
      setIsPending(false) // Kembalikan status tombol setelah proses selesai
    }
  }

  return (
    <main className="auth-page">
      <SiteHeader isAuthenticated={isAuthenticated} onNavigate={onNavigate} />

      <section className="auth-stage">
        <form className="auth-card" onSubmit={handleSubmit}>
          <header className="auth-card__header">
            <h1>{isSignup ? 'DAFTAR' : 'MASUK'}</h1>
          </header>

          <div className="auth-card__body">
            <label className="auth-row">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="masukkan email anda"
                required
                disabled={isPending}
              />
            </label>

            {isSignup && (
              <label className="auth-row">
                <span>Nama Pengguna</span>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={updateField}
                  placeholder="masukkan nama pengguna anda"
                  required
                  disabled={isPending}
                />
              </label>
            )}

            <label className="auth-row">
              <span>Kata Sandi</span>
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder="masukkan kata sandi"
                  minLength="6"
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  disabled={isPending}
                >
                  <EyeIcon />
                </button>
              </div>
            </label>

            {message && <p className="auth-message">{message}</p>}

            <div className="auth-actions">
              <button
                type="button"
                className="auth-switch"
                onClick={() => onNavigate(isSignup ? 'login' : 'signup')}
                disabled={isPending}
              >
                {isSignup ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar disini!'}
              </button>

              {/* Ditambahkan pengecekan isPending agar UI informatif saat loading auth */}
              <button type="submit" className="auth-submit" disabled={isPending}>
                {isPending ? 'MEMPROSES...' : isSignup ? 'DAFTAR' : 'MASUK'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

export default AuthPage