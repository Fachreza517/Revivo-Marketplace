import { useEffect, useState } from 'react'
import logoRevivo from '../assets/logo-revivo.svg'
import { footerGroups, paymentMethods } from '../data/localData.js'
import SiteHeader from './SiteHeader.jsx'

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
    <main className="landing-page store-page">
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

      {children}

      <footer className="site-footer" id="footer">
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

export default StoreLayout
