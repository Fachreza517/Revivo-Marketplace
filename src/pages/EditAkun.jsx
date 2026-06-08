import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function EditAkun({ isAuthenticated, onNavigate }) {
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('username, full_name').eq('id', user.id).maybeSingle()
      if (data) {
        setUsername(data.username || '')
        setFullName(data.full_name || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleUpdate(e) {
    e.preventDefault()
    setUpdating(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Sesi login tidak valid")

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: username.trim(),
          full_name: fullName.trim()
        })

      if (error) throw error

      // Jika berhasil, berikan notifikasi sukses...
      alert('Data identitas profil berhasil diperbarui di Supabase!')
      
      // 🌟 KUNCI UTAMA: Arahkan langsung kembali ke halaman Profil!
      onNavigate('profile')

    } catch (err) {
      alert('Gagal memperbarui data: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', fontSize: '1.8rem' }}>EDIT INFORMASI AKUN</h1>
        
        {loading ? (
          <p>Membaca enkripsi identitas...</p>
        ) : (
          <form onSubmit={handleUpdate} style={{ background: '#fff', border: '1px solid #ccc', padding: '20px', borderRadius: '4px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Username Toko / Akun:</strong>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <strong>Nama Lengkap Pengguna:</strong>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem' }} />
            </label>
            <button type="submit" disabled={updating} style={{ background: '#ff7f00', color: '#fff', border: '0', padding: '10px 20px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start', fontSize: '1rem' }}>
              {updating ? 'MEMPROSES...' : 'UPDATE DATA'}
            </button>
          </form>
        )}
      </div>
    </StoreLayout>
  )
}

export default EditAkun