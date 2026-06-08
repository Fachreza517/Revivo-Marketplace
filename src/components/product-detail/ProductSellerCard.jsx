function ProductSellerCard({ seller, onChat, onVisitStore }) {
  if (!seller) return null;

  return (
    <section className="product-seller">
      <h2 className="product-seller__title">Penjual</h2>
      <div className="product-seller__card" onClick={onVisitStore} style={{ cursor: 'pointer' }}>
        
        {/* AVATAR */}
        {seller.avatar ? (
          <img className="product-seller__avatar" src={seller.avatar} alt={seller.shopName} style={{ objectFit: 'cover' }} />
        ) : (
          <div className="product-seller__avatar product-seller__avatar--fallback">
            {seller.shopName?.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* INFO TERTUMPUK VERTIKAL */}
        <div className="product-seller__info">
          <strong style={{ display: 'block', fontSize: '1rem' }}>{seller.shopName}</strong>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>@{seller.name}</span>
          <p style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
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