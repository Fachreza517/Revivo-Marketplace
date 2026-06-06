import { useEffect, useState } from 'react'
import logoRevivo from '../assets/logo-revivo.svg'
import { footerGroups, paymentMethods } from '../data/localData.js'
import SiteHeader from './SiteHeader.jsx'

// 🌟 PERBAIKAN: Jalur disesuaikan menggunakan string absolut folder public/ (Tanpa tanda '../')
const FOOTER_PAYMENT_LOGOS = {
  VISA: '/gambar-visa.png',
  MASTER: '/gambar-mastercard.png',
  BCA: '/gambar-bca.png',
  OVO: '/gambar-ovo.png',
  GOPAY: '/gambar-gopay.png'
}

function StoreLayout({
  isAuthenticated,
  onNavigate,
  children,
  showPromo = true,
  initialSearch = '',
}) {
  const [search, setSearch] = useState(initialSearch)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  function handleSearchSubmit(value) {
    onNavigate('shop', { search: value })
  }

  return (
    <main className="landing-page store-page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showPromo && (
        <section className="promo-bar" aria-label="Flash sale">
          <div className="promo-bar__label">FLASH SALE</div>
          <p className="promo-bar__copy">
            Diskon hingga <strong>90%</strong> untuk produk pilihan!
          </p>
          <button type="button" onClick={() => onNavigate('shop')}>
            BELANJA SEKARANG
          </button>
        </section>
      )}

      <SiteHeader
        isAuthenticated={isAuthenticated}
        onNavigate={onNavigate}
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      <div style={{ flex: '1 0 auto' }}>
        {children}
      </div>

      {/* FOOTER UNIVERSAL REVIVO */}
      <footer className="site-footer" id="footer" style={{ marginTop: 'auto' }}>
        <div className="site-footer__top">
          <div className="footer-brand">
            <img src={logoRevivo} alt="Revivo" />
            <p>Marketplace elektronik bekas terpercaya dengan garansi kualitas dan harga terbaik.</p>
          </div>

          {footerGroups.map((group) => (
            <div className="footer-links" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link) => {
                let tabKey = 'tentang-kami'
                let targetPage = 'footer-content'

                // Kelompok Tentang
                if (link === 'Tentang Kami') tabKey = 'tentang-kami'
                if (link === 'Cara Kerja') tabKey = 'cara-kerja'
                if (link === 'Blog') tabKey = 'blog'
                if (link === 'Karir') tabKey = 'karir'

                // Kelompok Bantuan
                if (link === 'Pusat Bantuan') tabKey = 'pusat-bantuan'
                if (link === 'Hubungi Kami') tabKey = 'hubungi-kami'
                if (link === 'Lacak Pesanan') {
                  targetPage = 'lacak-pesanan'
                  tabKey = 'lacak-pesanan'
                }
                if (link === 'FAQ') tabKey = 'faq'

                // Kelompok Kebijakan
                if (link === 'Syarat & Ketentuan') tabKey = 'syarat-ketentuan'
                if (link === 'Kebijakan Privasi') tabKey = 'kebijakan-privasi'
                if (link === 'Kebijakan Pengembalian') tabKey = 'kebijakan-pengembalian'
                if (link === 'Keamanan') tabKey = 'keamanan'

                return (
                  <button
                    key={link}
                    type="button"
                    onClick={() => onNavigate(targetPage, { footerTab: tabKey })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      padding: '4px 0',
                      textAlign: 'left',
                      font: 'inherit',
                      cursor: 'pointer',
                      display: 'block',
                      transition: 'color 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#ff7f00'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    {link}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="site-footer__bottom">
          <p>(c) 2026 Revivo. Hak Cipta Dilindungi.</p>
          
          <div className="payment-list" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <strong>Metode Pembayaran:</strong>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {paymentMethods.map((method) => {
                const key = method === 'MASTER' ? 'MASTER' : method.toUpperCase()
                const imagePath = FOOTER_PAYMENT_LOGOS[key]

                return (
                  <span 
                    key={method}
                    style={{
                      background: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '30px',
                      width: '60px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* 🌟 SELESAI: Hanya merender gambar logo murni dari folder public tanpa ada teks cetak kaku */}
                    {imagePath ? (
                      <img 
                        src={imagePath} 
                        alt={method} 
                        style={{ height: '100%', width: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <small style={{ color: '#000', fontSize: '0.65rem' }}>{method}</small>
                    )}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default StoreLayout