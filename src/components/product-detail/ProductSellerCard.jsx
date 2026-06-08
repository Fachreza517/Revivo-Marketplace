function ProductSellerCard({ seller, onChat, onVisitStore }) {
  if (!seller) return null;

  // Debugging: Kita tampilkan apa yang sebenarnya diterima komponen ini
  console.log("Data Seller yang diterima Card:", seller);

  return (
    <section className="product-seller">
      <h2 className="product-seller__title">Penjual</h2>
      <div className="product-seller__card" onClick={onVisitStore} style={{ cursor: 'pointer' }}>
        
        {/* FOTO PROFIL */}
        {seller.avatar ? (
          <img className="product-seller__avatar" src={seller.avatar} alt={seller.shopName} />
        ) : (
          <div className="product-seller__avatar product-seller__avatar--fallback">
            {seller.shopName.charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="product-seller__info">
          {/* NAMA TOKO (Harusnya Nguawor.id) */}
          <strong style={{ display: 'block' }}>{seller.shopName}</strong>
          
          {/* NAMA PEMILIK (Harusnya Nguawor) */}
          <span className="product-seller__name">@{seller.name}</span>
          
          {/* LOKASI */}
          <p className="product-seller__location">
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