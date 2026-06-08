import { useEffect, useState } from 'react'
import heroPhones from '../assets/hero-1.png'
import ProductCard from '../components/ProductCard.jsx'
import SiteHeader from '../components/SiteHeader.jsx'
import { categories, footerGroups, paymentMethods } from '../data/localData.js'
import logoRevivo from '../assets/logo-revivo.svg'
import { supabase } from '../integrations/supabase/client.js'
import { savingsPercent } from '../utils/formatPrice.js'

// Import gambar pembayaran untuk mapping lokal
import visaLogo from "../assets/gambar-visa.png"
import masterLogo from "../assets/gambar-mastercard.png"
import bcaLogo from "../assets/gambar-bca.png"
import ovoLogo from "../assets/gambar-ovo.png"
import gopayLogo from "../assets/gambar-gopay.png"

const logoMap = {
  'VISA': visaLogo,
  'MASTER': masterLogo,
  'BCA': bcaLogo,
  'OVO': ovoLogo,
  'GOPAY': gopayLogo
};

function CategoryIcon({ type }) {
  if (type === 'laptop') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h12v10H6zM4 19h16l-1.5-4h-13z" /></svg>
  if (type === 'monitor') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v11H5zM12 15v5M9 20h6" /></svg>
  if (type === 'audio') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3M4 14h4v6H4zM16 14h4v6h-4z" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5z M10 18h4" /></svg>
}

function Landing({ isAuthenticated, onNavigate, listingsVersion = 0 }) {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getFeaturedProducts() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'available')

        if (error) throw error

        if (data) {
          const formatted = data.map((item) => {
            const priceVal = Number(item.price_value || 0)
            const oldPriceVal = Number(item.old_price_value || 0)
            return {
              id: item.id,
              name: item.name,
              category: item.category,
              priceValue: priceVal,
              price: `Rp ${priceVal.toLocaleString('id-ID')}`,
              oldPrice: oldPriceVal > 0 ? `Rp ${oldPriceVal.toLocaleString('id-ID')}` : '',
              oldPriceValue: oldPriceVal,
              badge: item.badge,
              score: item.score,
              image: item.image_url || '/placeholder.svg',
              discount: savingsPercent(priceVal, oldPriceVal)
            }
          })

          const sorted = formatted.sort((a, b) => b.discount - a.discount).slice(0, 4)
          setFeaturedProducts(sorted)
        }
      } catch (err) {
        console.error('Gagal memuat produk:', err.message)
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
        <p className="promo-bar__copy">Diskon hingga <strong>90%</strong> untuk produk pilihan!</p>
        <button type="button" onClick={() => onNavigate('shop')}>BELANJA SEKARANG</button>
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
        ) : (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={(id) => onNavigate('product-detail', { productId: id })} />
            ))}
          </div>
        )}
        <div className="section-block__actions">
          <button type="button" className="button button--orange" onClick={() => onNavigate('shop')}>LIHAT SEMUA PRODUK</button>
        </div>
      </section>

      <section className="section-block section-block--categories">
        <h2>CARI KATEGORI</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <button className="category-card" type="button" key={category.label} onClick={() => onNavigate('shop', { category: category.shopId })}>
              <CategoryIcon type={category.icon} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      {!isAuthenticated && (
        <section className="join-panel">
          <div className="join-card">
            <h2>GABUNG DENGAN KAMI!</h2>
            <p>Dipercaya 2000 pengguna untuk jual beli elektronik second dari berbagai era.</p>
            <div className="join-card__actions">
              <button type="button" className="button button--light" onClick={() => onNavigate('signup')}>DAFTAR SEKARANG</button>
              <button type="button" className="button button--orange" onClick={() => onNavigate('login')}>MASUK</button>
            </div>
          </div>
        </section>
      )}

      <footer className="site-footer">
        <div className="site-footer__top">
          <div className="footer-brand">
            <img src={logoRevivo} alt="Revivo" />
            <p>Marketplace elektronik bekas terpercaya.</p>
          </div>
          {footerGroups.map((group) => (
            <div className="footer-links" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => <a href="#footer" key={link}>{link}</a>)}
            </div>
          ))}
        </div>
        <div className="site-footer__bottom">
          <p>(c) 2026 Revivo. Hak Cipta Dilindungi.</p>
          <div className="payment-list">
            <strong>Metode Pembayaran:</strong>
            {paymentMethods.map((method) => (
              <img 
                key={method} 
                src={logoMap[method]} 
                alt={method} 
                style={{ height: '24px', margin: '0 5px', display: 'inline-block', objectFit: 'contain' }} 
              />
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}

export default Landing