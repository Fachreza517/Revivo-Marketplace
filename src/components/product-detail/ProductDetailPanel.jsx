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

// 🌟 PERBAIKAN 1: Tambahkan onContactSeller ke dalam daftar Props
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

            {onToggleWishlist && (
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
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            )}

          </div>
        </div>

        {/* SISI KANAN: BLOK BELANJA & INFORMASI HARGA */}
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

          {/* 🌟 PERBAIKAN 2: Sambungkan langsung onChat ke prop onContactSeller tanpa logika dummy */}
          <ProductSellerCard
            seller={product.seller}
            onChat={onContactSeller} 
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

        {/* Tab Deskripsi */}
        {activeTab === 'description' && (
          <div className="product-detail__tab-panel">
            <p>{product.description || 'Produk second berkualitas dari Revivo.'}</p>
          </div>
        )}

        {/* Tab Spesifikasi */}
        {activeTab === 'specs' && (
          <div className="product-detail__tab-panel product-detail__specs">
            <h2>Spesifikasi Teknis:</h2>
            {product.specs && product.specs.length > 0 ? (
              <dl>
                {product.specs.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>Spesifikasi lengkap tersedia saat checkout.</p>
            )}
          </div>
        )}

        {/* Tab Ulasan/Review */}
        {activeTab === 'reviews' && (
          <div className="product-detail__tab-panel">
            {onSendReview && reviewState && (
              <form onSubmit={onSendReview} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #eee' }}>
                <h3>Berikan Ulasan Kondisi Hardware</h3>
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span>Nama Pemeriksa</span>
                    <input type="text" value={reviewState.reviewName} onChange={(e) => reviewState.setReviewName(e.target.value)} required />
                  </label>
                  <label style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span>Skala Kepuasan</span>
                    <select value={reviewState.ratingInput} onChange={(e) => reviewState.setRatingInput(e.target.value)}>
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                    </select>
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                  <span>Ulasan Fisik & Fungsionalitas</span>
                  <textarea value={reviewState.commentInput} onChange={(e) => reviewState.setCommentInput(e.target.value)} required rows={3} />
                </label>
                <button type="submit" disabled={reviewState.submittingReview}>
                  {reviewState.submittingReview ? 'MENGIRIMKAN...' : 'KIRIM REVIEW'}
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              {reviews.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Belum ada ulasan untuk produk ini.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong>{rev.buyer_name}</strong>
                      <span>{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    <p>{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </section>

      {/* --- RELATED PRODUCTS --- */}
      {similar.length > 0 && (
        <section className="product-detail__similar">
          <h2>PRODUK SERUPA</h2>
          <div className="product-grid product-grid--similar">
            {similar.map((item) => (
              <ProductCard key={item.id} product={item} onSelect={(id) => onNavigate('product-detail', { productId: id })} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPanel