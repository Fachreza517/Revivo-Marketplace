function ProductCard({ product, onSelect }) {
  const Tag = onSelect ? 'button' : 'article'
  const tagProps = onSelect
    ? { type: 'button', className: 'product-card product-card--clickable', onClick: () => onSelect(product.id) }
    : { className: 'product-card' }

  return (
    <Tag {...tagProps}>
      {/* 🌟 DIOPTIMALKAN: Ditambahkan position relative pada pembungkus media */}
      <div className="product-card__media" style={{ position: 'relative' }}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="score-badge">{product.score}</span>
        <span className="status-badge">{product.badge}</span>

        {/* 🌟 BARU: Indikator Gambar Favorit Statis di Pojok Kanan Bawah Foto */}
        {product.isFav && (
          <div 
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(255, 255, 255, 0.95)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              zIndex: 2,
              animation: 'pulse 1.5s infinite alternate' // Opsional: Efek animasi lembut jika didukung CSS tim kamu
            }}
          >
            <span style={{ fontSize: '1.1rem', color: '#e53e3e', lineHeight: '1' }}>❤️</span>
          </div>
        )}
      </div>
      <h3>{product.name}</h3>
      <div className="product-card__price">
        <strong>{product.price}</strong>
        {product.oldPrice && <span>{product.oldPrice}</span>}
      </div>
    </Tag>
  )
}

export default ProductCard