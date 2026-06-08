function ProductSellerCard({ seller, onChat, onVisitStore }) {
  if (!seller) return null

  return (
    <section className="product-seller" aria-label="Informasi penjual">
      <h2 className="product-seller__title">Penjual</h2>
      
      {/* Container Klikable */}
      <div 
        className="product-seller__card" 
        onClick={onVisitStore}
        style={{ cursor: 'pointer' }}
      >
        {seller.avatar ? (
          <img className="product-seller__avatar" src={seller.avatar} alt={seller.shopName} style={{ objectFit: 'cover' }} />
        ) : (
          <div className="product-seller__avatar product-seller__avatar--fallback">
            {seller.shopName.slice(0, 1).toUpperCase()}
          </div>
        )}
        
        <div className="product-seller__info">
          {/* Nama Toko */}
          <strong style={{ display: 'block', fontSize: '1rem' }}>{seller.shopName}</strong>
          {/* Nama Pemilik/Username */}
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>@{seller.name}</span>
          {/* Lokasi di bawah */}
          <p style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            📍 {seller.location}
          </p>
        </div>
        
        <button 
          type="button" 
          className="button button--outline product-seller__chat" 
          onClick={(e) => { e.stopPropagation(); onChat(); }}
        >
          Chat Penjual
        </button>
      </div>
    </section>
  )
}
export default ProductSellerCard