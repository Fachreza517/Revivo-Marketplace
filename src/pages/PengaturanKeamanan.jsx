import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function PengaturanKeamanan({ isAuthenticated, onNavigate }) {
  const [user, setUser] = useState(null)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // 1. Verifikasi Password Lama
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (signInError) throw new Error("Password saat ini salah.")

      // 2. Update ke Password Baru
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Password berhasil diperbarui!' })
      setOldPassword('')
      setNewPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) setMessage({ type: 'error', text: error.message })
    else setMessage({ type: 'success', text: 'Link reset password telah dikirim ke email Anda.' })
    setLoading(false)
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
        <h1>Keamanan Akun</h1>

        {message.text && (
          <div style={{ padding: '10px', marginBottom: '20px', background: message.type === 'success' ? '#d4edda' : '#f8d7da' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="password" placeholder="Masukkan password saat ini" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required style={{ padding: '10px' }} />
          <input type="password" placeholder="Masukkan password baru" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ padding: '10px' }} />
          
          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#0d3b66', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Memproses...' : 'SIMPAN PASSWORD'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#ff7f00', textDecoration: 'underline', cursor: 'pointer' }}>
            Lupa password? Kirim link reset ke email
          </button>
        </div>
      </div>
    </StoreLayout>
  )
}
export default PengaturanKeamanan