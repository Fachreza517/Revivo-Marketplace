import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function KartuAlamat({ isAuthenticated, onNavigate }) {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function loadAddress() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase.from('profiles').select('address').eq('id', user.id).maybeSingle()
      if (data?.address) setAddress(data.address)
      setLoading(false)
    }
    loadAddress()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setUpdating(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, address: address.trim() })

    setUpdating(false)
    if (!error) alert('Alamat pengiriman logistik utama berhasil disimpan ke Supabase Cloud!')
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', fontSize: '1.8rem' }}>KARTU & ALAMAT UTAMA</h1>
        
        {loading ? (
          <p>Mengunduh koordinat lokasi...</p>
        ) : (
          <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #ccc', padding: '20px', borderRadius: '4px', marginTop: '20px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <strong>Alamat Pengiriman Utama:</strong>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                rows={3}
                required
                style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </label>
            <button 
              type="submit" 
              disabled={updating}
              style={{ background: '#0d3b66', color: '#fff', border: '0', padding: '10px 20px', marginTop: '15px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
            >
              {updating ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
            </button>
          </form>
        )}
      </div>
    </StoreLayout>
  )
}

export default KartuAlamat