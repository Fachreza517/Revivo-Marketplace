import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function LacakPesanan({ isAuthenticated, onNavigate }) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)

  // Fungsi utama untuk menarik data order aktif terbaru dari cloud
  async function fetchLiveTracking() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          resi_number,
          tracking_status,
          shipping_address,
          total_price,
          listings ( name )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false }) // Ambil orderan terbaru
        .limit(1)
        .maybeSingle()

      if (!error && data) setOrder(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveTracking()
  }, [])

  // 🌟 FUNGSI SIMULATOR KURIR: Merubah status di database Supabase secara otomatis & bertahap
  async function handleStartSimulation() {
    if (!order) return
    setSimulating(true)

    const statusUrutan = ['Pesanan Dibuat', 'Lolos Health Check', 'Dalam Pengiriman', 'Selesai']
    
    for (let i = 0; i < statusUrutan.length; i++) {
      // Beri jeda simulasi selama 2.5 detik per tahapan kurir
      await new Promise((resolve) => setTimeout(resolve, 2500))
      
      const statusBaru = statusUrutan[i]
      
      // Tembak perubahan langsung ke kolom tracking_status di Supabase Cloud
      const { error } = await supabase
        .from('orders')
        .update({ tracking_status: statusBaru })
        .eq('id', order.id)

      if (!error) {
        // Tarik data terbaru ke UI agar lingkaran menyala dinamis
        await fetchLiveTracking()
      }
    }
    
    setSimulating(false)
    alert('Simulasi Selesai! Gawai REVIVO sukses sampai di tangan pembeli.')
  }

  const currentStatus = order?.tracking_status || 'Pesanan Dibuat'
  
  const steps = [
    { title: 'Pesanan Dibuat', desc: 'Menunggu konfirmasi verifikasi hardware oleh seller.', done: true },
    { title: 'Lolos Health Check', desc: 'Tim REVIVO menyetujui skor kondisi kesehatan gawai.', done: ['Lolos Health Check', 'Dalam Pengiriman', 'Selesai'].includes(currentStatus) },
    { title: 'Dalam Pengiriman', desc: 'Paket gawai sedang dibawa kurir menuju lokasi anda.', done: ['Dalam Pengiriman', 'Selesai'].includes(currentStatus) },
    { title: 'Selesai', desc: 'Produk diterima dan dana diteruskan ke rekening penjual.', done: currentStatus === 'Selesai' },
  ]

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ color: '#0d3b66', margin: 0, fontSize: '1.8rem' }}>LACAK PESANAN</h1>
          
          {/* 🛠️ TOMBOL SIMULASI INTERAKTIF UNTUK DEMO DOSEN */}
          {order && (
            <button
              onClick={handleStartSimulation}
              disabled={simulating}
              style={{
                background: simulating ? '#666' : '#0d3b66',
                color: '#fff',
                border: '0',
                padding: '10px 18px',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: simulating ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {simulating ? '⏳ SIMULASI SEDANG BERJALAN...' : '⚡ JALANKAN SIMULASI KURIR LIVE'}
            </button>
          )}
        </div>
        
        {loading ? (
          <p style={{ marginTop: '20px' }}>Sinkronisasi status kurir siber...</p>
        ) : !order ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: '#666', fontStyle: 'italic' }}>Kamu belum memiliki riwayat pembelian gawai aktif.</p>
            <button type="button" className="button button--orange" onClick={() => onNavigate('shop')} style={{ marginTop: '15px' }}>
              Belanja Sekarang
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #ccc', padding: '25px', borderRadius: '4px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            
            {/* Informasi Resi */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>No. Resi: <strong style={{ color: '#0d3b66' }}>{order.resi_number}</strong></p>
                <small style={{ color: '#555', fontSize: '0.95rem' }}>Gawai: <strong>{order.listings?.name}</strong></small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: '#ff7f00', color: '#fff', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {currentStatus.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Garis Alur Indikator Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', paddingLeft: '10px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: step.done ? '#ff7f00' : '#ccc',
                    marginTop: '4px', flexShrink: 0,
                    boxShadow: step.done ? '0 0 8px rgba(255,127,0,0.5)' : 'none',
                    transition: 'all 0.4s ease'
                  }} />
                  <div>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: step.done ? '#111' : '#888', transition: 'color 0.4s' }}>{step.title}</h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>
    </StoreLayout>
  )
}

export default LacakPesanan