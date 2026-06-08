import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Pengaturan({ isAuthenticated, onNavigate }) {
  const [profile, setProfile] = useState({ full_name: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setProfile({ full_name: user.user_metadata?.full_name || '', email: user.email })
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  async function updateProfile(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.full_name }
    })
    
    if (error) setMessage('Gagal memperbarui profil: ' + error.message)
    else setMessage('Profil berhasil diperbarui!')
    setLoading(false)
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px' }}>PENGATURAN AKUN</h1>

        {/* Form Profil */}
        <form onSubmit={updateProfile} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nama Lengkap:</label>
            <input 
              type="text" 
              value={profile.full_name}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email (Tidak dapat diubah):</label>
            <input type="email" value={profile.email} disabled style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #eee', background: '#f5f5f5' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#0d3b66', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Menyimpan...' : 'SIMPAN PERUBAHAN'}
          </button>
          {message && <p style={{ marginTop: '10px', color: '#ff7f00', fontWeight: 'bold' }}>{message}</p>}
        </form>

        {/* Pengaturan Sistem */}
        <h2 style={{ color: '#0d3b66', marginTop: '40px' }}>PREFERENSI SISTEM</h2>
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '4px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
            <span>Terima notifikasi email untuk pembaruan produk</span>
          </label>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '18px', height: '18px' }} />
            <span>Mode Gelap (Beta)</span>
          </label>
          <hr style={{ margin: '10px 0' }} />
          <p style={{ fontSize: '0.8rem', color: '#666' }}>
            Status PostgreSQL: <span style={{ color: 'green', fontWeight: 'bold' }}>Terhubung (Realtime)</span>
          </p>
        </div>
      </div>
    </StoreLayout>
  )
}

export default Pengaturan