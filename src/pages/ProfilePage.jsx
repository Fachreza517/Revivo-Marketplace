import { useEffect, useState } from 'react'
import logoRevivo from '../assets/logo-revivo.svg'
import SiteHeader from '../components/SiteHeader.jsx'
import { footerGroups, paymentMethods } from '../data/localData.js'
// Import jembatan autentikasi dan database Supabase
import { supabase } from '../integrations/supabase/client.js'

const menuItems = [
  { label: 'DASBOR', icon: 'layers', active: true },
  { label: 'Lacak Pesanan', icon: 'pin' },
  { label: 'Keranjang Belanja', icon: 'cart' },
  { label: 'Jual Produk', icon: 'box' },
  { label: 'Daftar Keinginan', icon: 'heart' },
  { label: 'Bandingkan', icon: 'sync' },
  { label: 'Kartu & Alamat', icon: 'card' },
  { label: 'Pengaturan', icon: 'settings' },
  { label: 'Keluar', icon: 'logout', action: 'logout' },
]

function ProfileIcon({ type }) {
  const paths = {
    layers: 'M12 3 4 7l8 4 8-4-8-4Zm-8 8 8 4 8-4M4 15l8 4 8-4',
    pin: 'M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    cart: 'M4 5h2l2 10h9l2-7H7M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
    heart: 'M20.5 8.5c0 5-8.5 10-8.5 10s-8.5-5-8.5-10A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8.5 2.5Z',
    sync: 'M4 7h12l-3-3m7 13H8l3 3M18 4v5M6 15v5',
    card: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
    settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M1 12h3m16 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
    logout: 'M10 5H5v14h5M14 8l4 4-4 4M8 12h10',
    rocket: 'M12 15 9 12c1-5 4-8 9-9 1 5-1 8-6 12Zm-3 0-3 3m6-12 3 3M7 13l-3 1 1-3m6 6-1 3 3-1',
    box: 'M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 8 8-4M12 11 4 7m8 4v10',
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  )
}

function ProfileProductCard({ product, onSelect, onEdit, onToggleHide, onDelete, isOwner }) {
  const isHidden = product.status === 'hidden' || product.status === 'archived'

  return (
    <article 
      className="dashboard-product-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        opacity: isHidden ? 0.6 : 1, 
        border: isHidden ? '1px dashed #ccc' : '1px solid #e2e8f0'
      }}
    >
      <button 
        type="button" 
        className="dashboard-product-card--clickable-area" 
        onClick={() => onSelect(product.id)}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: 0, 
          textAlign: 'left', 
          width: '100%', 
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="dashboard-product-card__media">
          <img src={product.image} alt={product.name} style={{ width: '100%', objectFit: 'cover' }} />
          <span className="score-badge">{product.score}</span>
          <span className="status-badge" style={{ background: isHidden ? '#718096' : '#ff7f00' }}>
            {isHidden ? 'TERSEMBUNYI' : product.badge}
          </span>
        </div>
        
        <h3 style={{ 
          fontSize: '1rem', 
          margin: '10px 0 6px 0', 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          width: '100%'
        }}>
          {product.name}
        </h3>

        <div className="product-card__price" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'baseline', 
          gap: '4px 8px', 
          margin: '0 0 12px 0',
          width: '100%',
          overflow: 'hidden'
        }}>
          <strong style={{ fontSize: '1.05rem', color: '#0d3b66', whiteSpace: 'nowrap' }}>
            {product.price}
          </strong>
          {product.oldPrice && (
            <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {product.oldPrice}
            </span>
          )}
        </div>
      </button>

      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: 'auto' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(product.id); }}
            style={{ width: '100%', background: '#fff', color: '#ff7f00', border: '1px solid #ff7f00', padding: '6px 0', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            📝 Edit Gawai
          </button>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggleHide(product.id, isHidden); }}
              style={{ background: isHidden ? '#2b6cb0' : '#4a5568', color: '#fff', border: '0', padding: '6px 0', borderRadius: '4px', fontWeight: '500', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              {isHidden ? '👁️ Tampilkan' : '🚫 Sembunyikan'}
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(product.id, product.name); }}
              style={{ background: '#e53e3e', color: '#fff', border: '0', padding: '6px 0', borderRadius: '4px', fontWeight: '500', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              🗑️ Hapus
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

function ProfilePage({ user, onNavigate, onLogout, listingsVersion = 0 }) {
  const [userProducts, setUserProducts] = useState([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0) 
  
  const [cloudProfile, setCloudProfile] = useState({
    username: 'wongjowo',
    full_name: 'Wong Jowo Asli',
    address: 'Jl. Pahlawan No. 10, Kota Semarang, Jawa Tengah, 50131, Indonesia'
  })

  // 🌟 STATE BARU: Manajemen Mode Edit Akun
  const [isEditingAccount, setIsEditingAccount] = useState(false)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const displayName = cloudProfile.full_name || user?.username || 'wongjowo'
  const firstName = cloudProfile.username || user?.username || 'wongjowo'
  const email = user?.email || 'cumacobadoang527@gmail.com'

  useEffect(() => {
    async function loadUserDashboardData() {
      if (!user?.id) return
      setLoading(true)
      try {
        const { data: profData } = await supabase
          .from('profiles')
          .select('username, full_name, address')
          .eq('id', user.id)
          .maybeSingle()
          
        if (profData) {
          setCloudProfile({
            username: profData.username || 'wongjowo',
            full_name: profData.full_name || 'Wong Jowo Asli',
            address: profData.address || 'Jl. Pahlawan No. 10, Kota Semarang, Jawa Tengah, 50131, Indonesia'
          })
        }

        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })

        if (!listingsError && listingsData) {
          const formatted = listingsData.map((item) => ({
            id: item.id,
            name: item.name,
            price: `Rp ${Number(item.price_value).toLocaleString('id-ID')}`,
            oldPrice: item.old_price_value ? `Rp ${Number(item.old_price_value).toLocaleString('id-ID')}` : '',
            badge: item.badge,
            score: item.score,
            image: item.image_url || '/placeholder.svg',
            seller_id: item.seller_id,
            status: item.status 
          }))
          setUserProducts(formatted)
        }

        const { count, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('buyer_id', user.id)

        if (!ordersError && count !== null) {
          setTotalOrders(count)
        }

      } catch (err) {
        console.error('Gagal memuat dasbor personal:', err.message)
      } finally {
        setLoading(false)
      }
    }

    loadUserDashboardData()
  }, [user, listingsVersion, refreshTrigger])

  // 🌟 FUNGSI BARU: Simpan Nama Akun ke Database
  async function handleSaveProfile() {
    if (!editName.trim()) return
    
    setIsSaving(true)
    try {
      if (!user?.id) throw new Error("Sesi login tidak valid")

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName })
        .eq('id', user.id)

      if (error) throw error

      setCloudProfile(prev => ({ ...prev, full_name: editName }))
      setIsEditingAccount(false)

    } catch (err) {
      alert('Gagal memperbarui nama: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleHideProduct(id, currentHiddenStatus) {
    try {
      const nextStatus = currentHiddenStatus ? 'available' : 'hidden'
      const { error } = await supabase
        .from('listings')
        .update({ status: nextStatus })
        .eq('id', id)
        .eq('seller_id', user.id)

      if (error) throw error
      setRefreshTrigger(prev => prev + 1) 
    } catch (err) {
      alert('Gagal mengubah status visibilitas: ' + err.message)
    }
  }

  async function handleDeleteProduct(id, name) {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus permanen iklan "${name}" dari cloud database Revivo?`)
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id)
        .eq('seller_id', user.id) 

      if (error) throw error
      alert('Iklan gawai berhasil dihapus selamanya.')
      setRefreshTrigger(prev => prev + 1)
    } catch (err) {
      alert('Gagal menghapus produk: ' + err.message)
    }
  }

  function handleMenuClick(item) {
    if (item.action === 'logout') {
      onLogout()
      return
    }
    
    switch (item.label) {
      case 'DASBOR': onNavigate('profile'); break
      case 'Lacak Pesanan': onNavigate('lacak-pesanan'); break
      case 'Keranjang Belanja': onNavigate('cart'); break
      case 'Jual Produk': onNavigate('jual-barang'); break
      case 'Daftar Keinginan': onNavigate('wishlist'); break
      case 'Bandingkan': onNavigate('bandingkan'); break
      case 'Kartu & Alamat': onNavigate('kartu-alamat'); break
      case 'Pengaturan': onNavigate('pengaturan'); break
      default: break
    }
  }

  return (
    <main className="profile-page">
      <SiteHeader isAuthenticated onNavigate={onNavigate} />

      <section className="dashboard-shell">
        <aside className="dashboard-sidebar">
          {menuItems.map((item) => (
            <button
              className={item.active ? 'active' : ''}
              type="button"
              key={item.label}
              onClick={() => handleMenuClick(item)}
            >
              <ProfileIcon type={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-greeting">Halo, {firstName}</div>

          <section className="dashboard-cards">
            
            {/* 🌟 KOTAK INFORMASI AKUN (DENGAN FITUR INLINE EDITING) */}
            <article className="dashboard-card dashboard-card--account">
              <h2>INFORMASI AKUN</h2>
              <div className="dashboard-card__content account-summary">
                <div className="avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={displayName} />
                  ) : (
                    <span aria-hidden="true">
                      {displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                    </span>
                  )}
                </div>
                
                <div style={{ flex: '1', minWidth: '0' }}>
                  {isEditingAccount ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nama Lengkap Baru"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ff7f00', outline: 'none' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={handleSaveProfile} disabled={isSaving} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
                          {isSaving ? 'Menyimpan...' : 'SIMPAN'}
                        </button>
                        <button type="button" onClick={() => setIsEditingAccount(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                          BATAL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{displayName}</h3>
                      <p>Semarang, Jawa Tengah</p>
                    </>
                  )}
                </div>
                
                <p>Email Utama: {email}</p>
                {/* Info keamanan dan enkripsi bawaan template telah dihapus dari sini */}
                
                {!isEditingAccount && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditName(cloudProfile.full_name || '')
                      setIsEditingAccount(true)
                    }}
                  >
                    EDIT AKUN
                  </button>
                )}
              </div>
            </article>

            <article className="dashboard-card">
              <h2>ALAMAT UTAMA</h2>
              <div className="dashboard-card__content">
                <p>{displayName}</p>
                <p>{cloudProfile.address}</p>
                <p>Zona Waktu: WIB</p>
                <p>Email Kontak: {email}</p>
                <button type="button" onClick={() => onNavigate('kartu-alamat')}>EDIT ALAMAT</button>
              </div>
            </article>

            <div className="dashboard-stats">
              <article>
                <div><ProfileIcon type="rocket" /></div>
                <strong>{totalOrders}</strong>
                <span>Total Pesanan</span>
              </article>
              <article>
                <div><ProfileIcon type="box" /></div>
                <strong>{userProducts.length}</strong>
                <span>Total Penjualan</span>
              </article>
            </div>
          </section>

          <section className="history-panel">
            <h2>DAFTAR PRODUK ANDA (LIVE LISTINGS)</h2>
            {loading ? (
              <p className="shop-empty">Sinkronisasi data etalase pribadi...</p>
            ) : userProducts.length === 0 ? (
              <p className="shop-empty">Kamu belum memasang iklan barang apa pun di toko Revivo.</p>
            ) : (
              <div className="history-grid">
                {userProducts.map((product) => (
                  <ProfileProductCard
                    key={product.id}
                    product={product}
                    onSelect={(id) => onNavigate('product-detail', { productId: id })}
                    onEdit={(id) => onNavigate('edit-barang', { productId: id })}
                    onToggleHide={handleToggleHideProduct}
                    onDelete={handleDeleteProduct}
                    isOwner={user?.id === product.seller_id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer" style={{ marginTop: '50px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
        <div className="site-footer__top" style={{ display: 'flex', justifyContent: 'space-between', gap: '30px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div className="footer-brand" style={{ flex: '1', minWidth: '250px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff7f00', marginBottom: '10px' }}>REVIVO</h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Marketplace elektronik bekas terpercaya dengan garansi kualitas dan harga terbaik.
            </p>
          </div>

          {footerGroups && footerGroups.map((group) => (
            <div className="footer-links" key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '150px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', marginBottom: '5px' }}>{group.title}</h3>
              {group.links.map((link) => {
                let tabKey = 'tentang-kami'
                if (link === 'Cara Kerja') tabKey = 'cara-kerja'
                if (link === 'Syarat & Ketentuan') tabKey = 'syarat-ketentuan'
                if (link === 'Kebijakan Privasi') tabKey = 'kebijakan-privasi'
                if (link === 'Lacak Pesanan') tabKey = 'lacak-pesanan'
                
                const targetPage = link === 'Lacak Pesanan' ? 'lacak-pesanan' : 'footer-content'

                return (
                  <button
                    key={link}
                    type="button"
                    onClick={() => onNavigate(targetPage, { footerTab: tabKey })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      padding: '2px 0',
                      textAlign: 'left',
                      font: 'inherit',
                      cursor: 'pointer',
                      display: 'block',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#ff7f00'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e1'}
                  >
                    {link}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="site-footer__bottom" style={{ borderTop: '1px solid #334155', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>(c) 2026 Revivo. Hak Cipta Dilindungi.</p>
          <div className="payment-list" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Metode Pembayaran:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {paymentMethods && paymentMethods.map((method) => (
                <span 
                  key={method}
                  style={{
                    background: '#fff',
                    color: '#0f172a',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '60px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default ProfilePage