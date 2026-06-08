import { savingsPercent } from '../utils/formatPrice.js'

function ProductCard({ product, onSelect }) {
  const Tag = onSelect ? 'button' : 'article'
  const tagProps = onSelect
    ? { type: 'button', className: 'product-card product-card--clickable', onClick: () => onSelect(product.id) }
    : { className: 'product-card' }

  // 1. Menghitung Diskon
  const cleanPrice = Number(product.price.replace(/[^0-9]/g, ''));
  const cleanOldPrice = product.oldPrice ? Number(product.oldPrice.replace(/[^0-9]/g, '')) : 0;
  const discount = savingsPercent(cleanPrice, cleanOldPrice);

  return (
    <Tag {...tagProps}>
      {/* BAGIAN FOTO */}
      <div className="product-card__media" style={{ position: 'relative' }}>
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="score-badge">{product.score}</span>
        <span className="status-badge">{product.badge}</span>

        {product.isFav && (
          <div className="fav-icon" style={{
            position: 'absolute', bottom: '10px', right: '10px',
            background: 'rgba(255, 255, 255, 0.95)', width: '32px', height: '32px',
            borderRadius: '50%', display: 'flex', justifyContent: 'center',
            alignItems: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', zIndex: 2
          }}>
            <span style={{ fontSize: '1.1rem', color: '#e53e3e' }}>❤️</span>
          </div>
        )}
      </div>

      {/* BAGIAN INFO PRODUK */}
      <div style={{ padding: '12px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', height: '2.4em', overflow: 'hidden' }}>
          {product.name}
        </h3>
        
        <div className="product-card__price" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          
          {/* Harga Coret (Di Atas) */}
          {product.oldPrice && (
            <span style={{ 
              textDecoration: 'line-through', 
              color: '#ffffffa5', 
              fontSize: '0.8rem',
              display: 'block'
            }}>
              {product.oldPrice}
            </span>
          )}

          {/* Harga Jual + Badge Diskon (Satu Baris) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{product.price}</strong>
            
            {discount > 0 && (
              <span style={{ 
                background: '#ff7f00', 
                color: '#fff', 
                fontSize: '0.7rem', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontWeight: 'bold',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}>
                HEMAT {discount}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Tag>
  )
}

export default ProductCard