import { useEffect, useState } from 'react'
import heroPhones from '../assets/hero-1.png'
import ProductCard from '../components/ProductCard.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { categories, footerGroups, paymentMethods } from '../data/localData.js'
import logoRevivo from '../assets/logo-revivo.svg'
// Import jembatan Supabase Client
import { supabase } from '../integrations/supabase/client.js'

function CategoryIcon({ type }) {
  if (type === 'laptop') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 5h12v10H6zM4 19h16l-1.5-4h-13z" />
      </svg>
    )
  }

  if (type === 'monitor') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 4h14v11H5zM12 15v5M9 20h6" />
      </svg>
    )
  }

  if (type === 'audio') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 14v-3a8 8 0 0 1 16 0v3M4 14h4v6H4zM16 14h4v6h-4z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 3h14v18H5z M10 18h4" />
    </svg>
  )
}

function Landing({ isAuthenticated, onNavigate, listingsVersion = 0 }) {
  // 1. Siapkan state untuk menampung 4 produk tawaran spesial dari cloud
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // 2. Tarik 4 produk paling baru diunggah dari tabel listings
  useEffect(() => {
    async function getFeaturedProducts() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4) // Batasi hanya mengambil 4 item teratas

        if (error) throw error

        if (data) {
          // Format skema kolom database agar dikenali oleh ProductCard.jsx bawaan tim frontend
          const formatted = data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            priceValue: Number(item.price_value),
            price: `Rp ${Number(item.price_value).toLocaleString('id-ID')}`,
            oldPrice: item.old_price_value ? `Rp ${Number(item.old_price_value).toLocaleString('id-ID')}` : '',
            oldPriceValue: item.old_price_value ? Number(item.old_price_value) : 0,
            badge: item.badge,
            score: item.score,
            image: item.image_url || '/placeholder.svg'
          }))
          setFeaturedProducts(formatted)
        }
      } catch (err) {
        console.error('Gagal memuat produk unggulan beranda:', err.message)
      } finally {
        setLoading(false)
      }
    }

    getFeaturedProducts()
  }, [listingsVersion])

  return (
    <main className="landing-page">
      <section className="promo-bar" aria-label="Flash sale">
        <div className="promo-bar__label">FLASH SALE</div>
        <p className="promo-bar__copy">
          Diskon hingga <strong>90%</strong> untuk produk pilihan!
        </p>
        <button type="button" onClick={() => onNavigate('shop')}>
          BELANJA SEKARANG
        </button>
      </section>

      <SiteHeader isAuthenticated={isAuthenticated} onNavigate={onNavigate} />

      <section className="hero-panel">
        <p>#revivetheY2K</p>
        <div className="hero-copy">
          <h1>HP JADUL</h1>
          <span>Kembali Nge-Trend di 2026</span>
        </div>
        <img className="hero-devices" src={heroPhones} alt="" aria-hidden="true" />
      </section>

      <section className="section-block" id="belanja">
        <h2>TAWARAN SPESIAL</h2>
        
        {loading ? (
          <p className="shop-empty">Sinkronisasi tawaran gadget terbaru...</p>
        ) : featuredProducts.length === 0 ? (
          <p className="shop-empty">Belum ada tawaran spesial saat ini. Silakan pasang produk baru.</p>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(id) => onNavigate('product-detail', { productId: id })}
              />
            ))}
          </div>
        )}

        <div className="section-block__actions">
          <button type="button" className="button button--orange" onClick={() => onNavigate('shop')}>
            LIHAT SEMUA PRODUK
          </button>
        </div>
      </section>

      <section className="section-block section-block--categories">
        <h2>CARI KATEGORI</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <button
              className="category-card"
              type="button"
              key={category.label}
              onClick={() => onNavigate('shop', { category: category.shopId })}
            >
              <CategoryIcon type={category.icon} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="join-panel">
        <div className="join-card">
          <h2>GABUNG DENGAN KAMI!</h2>
          <p>Dipercaya 2000 pengguna untuk jual beli elektronik second dari berbagai era yang memenuhi hobi dan kebutuhan</p>
          <div className="join-card__actions">
            <button type="button" className="button button--light" onClick={() => onNavigate('signup')}>
              DAFTAR SEKARANG
            </button>
            <button type="button" className="button button--orange" onClick={() => onNavigate('login')}>
              MASUK
            </button>
          </div>
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

export default Landing