function ProductSellerCard({ seller, onChat, onVisitStore }) {
  if (!seller) return null

  // Fallback aman agar jika nama toko kosong, tidak menyebabkan layar putih (crash)
  const displayShopName = seller.shopName || seller.name || 'Toko Revivo'
  const initial = displayShopName.slice(0, 1).toUpperCase()

  return (
    <section className="product-seller" aria-label="Informasi penjual">
      <h2 className="product-seller__title">Penjual</h2>
      
      {/* 🌟 STRUKTUR ASLI DIKEMBALIKAN: 
          Kita menempelkan fungsi klik langsung ke div utama agar CSS Grid kalian tidak hancur */}
      <div 
        className="product-seller__card" 
        onClick={onVisitStore}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        title={`Kunjungi Toko ${displayShopName}`}
        onMouseOver={(e) => e.currentTarget.style.borderColor = '#ff7f00'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
      >
        
        {/* FOTO PROFIL: Akan otomatis menampilkan gambar terbaru dari Supabase Storage */}
        {seller.avatar ? (
          <img 
            className="product-seller__avatar" 
            src={seller.avatar} 
            alt={displayShopName} 
            style={{ objectFit: 'cover' }} 
          />
        ) : (
          <div className="product-seller__avatar product-seller__avatar--fallback" aria-hidden="true">
            {initial}
          </div>
        )}
        
        {/* NAMA TOKO & LOKASI: Akan otomatis sinkron dengan yang disetel di halaman Edit Profil */}
        <div className="product-seller__info">
          <strong style={{ display: 'block', transition: 'color 0.2s' }}>
            {displayShopName}
          </strong>
          <span className="product-seller__name">@{seller.name}</span>
          <p className="product-seller__location">
            <span aria-hidden="true">📍</span> {seller.location}
          </p>
        </div>
        
        {/* TOMBOL CHAT: Menggunakan e.stopPropagation() agar saat diklik tidak malah pindah ke toko */}
        <button 
          type="button" 
          className="button button--outline product-seller__chat" 
          onClick={(e) => {
            e.stopPropagation();
            onChat();
          }}
        >
          Chat Penjual
        </button>
      </div>
    </section>
  )
}

export default ProductSellerCard