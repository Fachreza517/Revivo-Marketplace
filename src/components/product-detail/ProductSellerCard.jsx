function ProductSellerCard({ seller, onChat }) {
  if (!seller) return null

  return (
    <section className="product-seller" aria-label="Informasi penjual">
      <h2 className="product-seller__title">Penjual</h2>
      <div className="product-seller__card">
        {seller.avatar ? (
          <img className="product-seller__avatar" src={seller.avatar} alt={seller.name} />
        ) : (
          <div className="product-seller__avatar product-seller__avatar--fallback" aria-hidden="true">
            {seller.name.slice(0, 1)}
          </div>
        )}
        <div className="product-seller__info">
          <strong>{seller.shopName}</strong>
          <span className="product-seller__name">@{seller.name}</span>
          <p className="product-seller__location">
            <span aria-hidden="true">📍</span> {seller.location}
          </p>
        </div>
        <button type="button" className="button button--outline product-seller__chat" onClick={onChat}>
          Chat Penjual
        </button>
      </div>
    </section>
  )
}

export default ProductSellerCard
