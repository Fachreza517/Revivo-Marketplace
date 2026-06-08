import StoreLayout from '../components/StoreLayout.jsx'
import { useNavigate } from 'react-router-dom'

function Pengaturan({ isAuthenticated, onNavigate }) {
  const menuItems = [
    { title: "Akun Saya", items: ["Keamanan & Akun", "Alamat Saya", "Kartu / Rekening Bank"] },
    { title: "Pengaturan", items: ["Pengaturan Chat", "Pengaturan Notifikasi", "Pengaturan Privasi"] },
    { title: "Bantuan", items: ["Pusat Bantuan", "Kebijakan"] }
  ];

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        <h1 style={{ color: '#0d3b66', marginBottom: '30px' }}>Pengaturan Akun</h1>
        
        {menuItems.map((group) => (
          <div key={group.title} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1rem', color: '#888', marginBottom: '10px' }}>{group.title}</h2>
            <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
              {group.items.map((item, index) => (
                <button 
                  key={item}
                  onClick={() => item === "Keamanan & Akun" ? onNavigate('pengaturan-keamanan') : null}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', width: '100%', padding: '15px 20px', 
                    borderBottom: index !== group.items.length - 1 ? '1px solid #eee' : 'none',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '1rem'
                  }}
                >
                  {item} <span>{'>'}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StoreLayout>
  )
}
export default Pengaturan