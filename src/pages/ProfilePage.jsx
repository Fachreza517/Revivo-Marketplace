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

function ProfileProductCard({ product, onSelect }) {
  const Tag = onSelect ? 'button' : 'article'
  const tagProps = onSelect
    ? {
        type: 'button',
        className: 'dashboard-product-card dashboard-product-card--clickable',
        onClick: () => onSelect(product.id),
      }
    : { className: 'dashboard-product-card' }

  return (
    <Tag {...tagProps}>
      <div className="dashboard-product-card__media">
        <img src={product.image} alt={product.name} />
        <span className="score-badge">{product.score}</span>
        <span className="status-badge">{product.badge}</span>
      </div>
      <h3>{product.name}</h3>
      <div className="product-card__price">
        <strong>{product.price}</strong>
        {product.oldPrice && <span>{product.oldPrice}</span>}
      </div>
    </Tag>
  )
}

function ProfilePage({ user, onNavigate, onLogout, listingsVersion = 0 }) {
  // State manajemen data personal dari server cloud
  const [userProducts, setUserProducts] = useState([])
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  const displayName = user?.username || 'Pengguna Revivo'
  const firstName = displayName.split(' ')[0] || displayName
  const email = user?.email || 'pembeli@revivo.com'

  // TARIK DATA SPESIFIK PENGGUNA BERDASARKAN USER ID AUTENTIKASI
  useEffect(() => {
    async function loadUserDashboardData() {
      if (!user?.id) return
      setLoading(true)
      try {
        // 1. Ambil list produk yang dijual oleh akun ini sendiri (Filter berdasarkan seller_id)
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
            image: item.image_url || '/placeholder.svg'
          }))
          setUserProducts(formatted)
        }

        // 2. Hitung statistik total pesanan belanja milik user ini di tabel orders
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
  }, [user, listingsVersion])

  function handleMenuClick(item) {
    if (item.action === 'logout') {
      onLogout()
      return
    }
    if (item.icon === 'cart') {
      onNavigate('cart')
    }
    if (item.label === 'Jual Produk') {
      onNavigate('jual-barang')
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
            <article className="dashboard-card dashboard-card--account">
              <h2>INFORMASI AKUN</h2>
              <div className="dashboard-card__content account-summary">
                <div className="avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={displayName} />
                  ) : (
                    <span aria-hidden="true">
                      {displayName
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h3>{displayName}</h3>
                  <p>Semarang, Jawa Tengah</p>
                </div>
                <p>Email Utama: {email}</p>
                <p>Status Keamanan: Terverifikasi SSL</p>
                <p>Enkripsi: Supabase Row Level Security</p>
                <button type="button">EDIT AKUN</button>
              </div>
            </article>

            <article className="dashboard-card">
              <h2>ALAMAT UTAMA</h2>
              <div className="dashboard-card__content">
                <p>{displayName}</p>
                <p>Jl. Pahlawan No. 10, Kota Semarang, Jawa Tengah, 50131, Indonesia</p>
                <p>Zona Waktu: WIB</p>
                <p>Email Kontak: {email}</p>
                <button type="button">EDIT ALAMAT</button>
              </div>
            </article>

            <div className="dashboard-stats">
              <article>
                <div>
                  <ProfileIcon type="rocket" />
                </div>
                {/* Menampilkan total pesanan real hasil query count tabel orders */}
                <strong>{totalOrders}</strong>
                <span>Total Pesanan</span>
              </article>
              <article>
                <div>
                  <ProfileIcon type="box" />
                </div>
                {/* Menampilkan jumlah ril listing yang diupload user */}
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
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="footer-brand">
            <img src={logoRevivo} alt="Revivo" />
            <p>Marketplace elektronik bekas terpercaya dengan garansi kualitas dan harga terbaik.</p>
          </div>

          {footerGroups.map((group) => (
            <div className="footer-links" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <a href="#footer" key={link}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="site-footer__bottom">
          <p>(c) 2026 Revivo. Hak Cipta Dilindungi.</p>
          <div className="payment-list">
            <strong>Metode Pembayaran:</strong>
            {paymentMethods.map((method) => (
              <span key={method}>{method}</span>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}

export default ProfilePage