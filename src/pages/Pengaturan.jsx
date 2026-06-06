import StoreLayout from '../components/StoreLayout.jsx'

function Pengaturan({ isAuthenticated, onNavigate }) {
  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', fontSize: '1.8rem' }}>PENGATURAN SISTEM</h1>
        
        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '4px', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="checkbox" defaultChecked disabled style={{ width: '18px', height: '18px' }} />
            <span>Aktifkan Sinkronisasi Otomatis PostgreSQL Realtime</span>
          </label>
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="checkbox" defaultChecked disabled style={{ width: '18px', height: '18px' }} />
            <span>Akses Bypass Row Level Security (RLS) untuk Pengembangan Kelompok</span>
          </label>
        </div>
      </div>
    </StoreLayout>
  )
}

export default Pengaturan