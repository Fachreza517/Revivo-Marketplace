import { useCart } from '../context/CartContext.jsx'
import logoRevivo from '../assets/logo-revivo.svg'

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
    </svg>
  )
}

function SiteHeader({ isAuthenticated, onNavigate, searchValue = '', onSearchChange, onSearchSubmit }) {
  const { itemCount } = useCart()

  function handleSearch(event) {
    event.preventDefault()
    onSearchSubmit?.(searchValue)
    onNavigate('shop', { search: searchValue })
  }

  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={() => onNavigate('landing')} aria-label="Kembali ke Revivo">
        <img src={logoRevivo} alt="Revivo" />
      </button>

      <form className="search-form" onSubmit={handleSearch}>
        <SearchIcon />
        <input
          type="search"
          placeholder="Cari produk..."
          aria-label="Cari produk"
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
        />
        <button type="submit">CARI!!</button>
      </form>

      <nav className="main-nav" aria-label="Navigasi utama">
        <button type="button" onClick={() => onNavigate('shop')}>
          BELANJA
        </button>
        <button type="button" onClick={() => onNavigate('chat')}>
          OBROLAN
        </button>
        <button type="button" onClick={() => onNavigate('jual-barang')}>
          JUAL PRODUK
        </button>
        <button type="button" onClick={() => onNavigate('cart')} className="main-nav__cart">
          KERANJANG{itemCount > 0 ? ` (${itemCount})` : ''}
        </button>
        <button type="button" onClick={() => onNavigate(isAuthenticated ? 'profile' : 'login')}>
          {isAuthenticated ? 'PROFIL' : 'MASUK'}
        </button>
      </nav>
    </header>
  )
}

export default SiteHeader
