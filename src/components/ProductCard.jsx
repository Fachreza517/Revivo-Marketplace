function ProductCard({ product, onSelect }) {
  const Tag = onSelect ? 'button' : 'article'
  const tagProps = onSelect
    ? { type: 'button', className: 'product-card product-card--clickable', onClick: () => onSelect(product.id) }
    : { className: 'product-card' }

  return (
    <Tag {...tagProps}>
      <div className="product-card__media">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="score-badge">{product.score}</span>
        <span className="status-badge">{product.badge}</span>
      </div>
      <h3>{product.name}</h3>
      <div className="product-card__price">
        <strong>{product.price}</strong>
        <span>{product.oldPrice}</span>
      </div>
    </Tag>
  )
}

export default ProductCard
