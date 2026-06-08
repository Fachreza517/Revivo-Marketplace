import { useState } from 'react'
import { getCategoryLabel, getProductsByIds } from '../../data/localData.js'
import { savingsPercent } from '../../utils/formatPrice.js'
import ProductCard from '../ProductCard.jsx'
import QuantityStepper from '../QuantityStepper.jsx'
import ProductSellerCard from './ProductSellerCard.jsx'

const TABS = [
  { id: 'description', label: 'DESKRIPSI' },
  { id: 'specs', label: 'SPESIFIKASI' },
  { id: 'reviews', label: 'REVIEW' },
]

function ProductDetailPanel({ 
  product, 
  onNavigate, 
  onAddToCart, 
  reviews = [], 
  onSendReview, 
  reviewState,
  isWishlisted = false,
  onToggleWishlist,
  togglingWishlist = false,
  onContactSeller
}) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImage, setActiveImage] = useState(0)

  const similar = product?.similarIds ? getProductsByIds(product.similarIds) : []
  const discount = savingsPercent(product.priceValue, product.oldPriceValue)

  function handleAddToCart() {
    onAddToCart(product.id, quantity)
  }

  return (
    <div className="product-detail">
      {/* --- BREADCRUMB --- */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate('landing')}>Home</button>
        <span aria-hidden="true"> / </span>
        <button type="button" onClick={() => onNavigate('shop', { category: product.category })}>
          {getCategoryLabel(product.category)}
        </button>
        <span aria-hidden="true"> / </span>
        <span>{product.name}</span>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="product-detail__hero">
        
        {/* SISI KIRI: BLOK GALERI FOTO */}
        <div className="product-detail__gallery" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <img
            className="product-detail__main-image"
            src={product.gallery[activeImage] ?? product.image}
            alt={product.name}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="product-detail__thumbs" style={{ margin: 0, flex: 1 }}>
              {product.gallery.map((src, index) => (
                <button
                  key={`${product.id}-thumb-${index}`}
                  type="button"
                  className={index === activeImage ? 'active' : ''}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>

            {/* TOMBOL WISHLIST */}
            <button
              type="button"
              onClick={onToggleWishlist}
              disabled={togglingWishlist}
              title={isWishlisted ? "Hapus dari Favorit" : "Tambah ke Favorit"}
              style={{
                background: 'none', border: 'none', fontSize: '2.2rem',
                cursor: togglingWishlist ? 'not-allowed' : 'pointer',
                padding: '5px 15px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'transform 0.2s ease', outline: 'none'
              }}
            >
              {isWishlisted ? '❤️' : '🩶'}
            </button>
          </div>
        </div>

        {/* SISI KANAN: INFORMASI PRODUK */}
        <div className="product-detail__buy">
          <h1>{product.name}</h1>
          <div className="product-detail__badges">
            <span className="product-detail__score">{product.score} Kondisi</span>
            <span className="status-badge status-badge--large">{product.badge}</span>
          </div>

          <div className="product-detail__price-box">
            <div className="product-detail__price-row">
              <strong>{product.price}</strong>
              <span>{product.oldPrice}</span>
            </div>
            {discount > 0 && <span className="product-detail__savings">HEMAT {discount}%</span>}
          </div>

          <div className="product-detail__quantity">
            <span>Jumlah:</span>
            <QuantityStepper value={quantity} min={1} max={product.stock} onChange={setQuantity} />
            <span className="product-detail__stock">Stok: {product.stock} unit</span>
          </div>

          <ProductSellerCard
            seller={product.seller}
            onChat={onContactSeller} 
            onVisitStore={() => onNavigate('toko', { sellerId: product.sellerId })} 
          />

          <div className="product-detail__actions">
            <button type="button" className="button button--cart" onClick={handleAddToCart}>
              TAMBAH KE KERANJANG
            </button>
          </div>
        </div>
      </div>

      {/* --- TABS SYSTEM --- */}
      <section className="product-detail__tabs">
        <div className="product-detail__tab-list" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} {tab.id === 'reviews' ? `(${reviews.length})` : ''}
            </button>
          ))}
        </div>

        {/* Tab Deskripsi, Spesifikasi, & Review (logika tetap sama) */}
        {activeTab === 'description' && (
          <div className="product-detail__tab-panel"><p>{product.description}</p></div>
        )}
      </section>
    </div>
  )
}

export default ProductDetailPanel