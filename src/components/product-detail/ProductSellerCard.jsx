function ProductSellerCard({ seller, onChat, onVisitStore }) {
  if (!seller) return null

  return (
    <section className="product-seller" aria-label="Informasi penjual">
      <h2 className="product-seller__title">Penjual</h2>
      <div className="product-seller__card">
        
        {/* 🌟 AREA PROFIL YANG BISA DIKLIK MENGARAH KE TOKO */}
        <button 
          type="button" 
          onClick={onVisitStore}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            background: 'transparent', 
            border: 'none', 
            padding: '0', 
            textAlign: 'left', 
            cursor: 'pointer',
            width: '100%',
            marginBottom: '15px'
          }}
          title={`Kunjungi Toko ${seller.shopName}`}
        >
          {seller.avatar ? (
            <img className="product-seller__avatar" src={seller.avatar} alt={seller.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="product-seller__avatar product-seller__avatar--fallback" aria-hidden="true" style={{ width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {seller.shopName ? seller.shopName.slice(0, 1).toUpperCase() : seller.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          
          <div className="product-seller__info">
            <strong style={{ display: 'block', fontSize: '1.05rem', color: '#0f172a', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#ff7f00'} onMouseOut={(e) => e.target.style.color = '#0f172a'}>
              {seller.shopName}
            </strong>
            <span className="product-seller__name" style={{ fontSize: '0.85rem', color: '#64748b' }}>@{seller.name}</span>
            <p className="product-seller__location" style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              <span aria-hidden="true">📍</span> {seller.location}
            </p>
          </div>
        </button>

        {/* 🌟 TOMBOL CHAT TETAP TERPISAH */}
        <button type="button" className="button button--outline product-seller__chat" onClick={onChat} style={{ width: '100%' }}>
          Chat Penjual
        </button>
      </div>
    </section>
  )
}

export default ProductSellerCard