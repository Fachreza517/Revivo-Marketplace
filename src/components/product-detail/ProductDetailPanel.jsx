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

  // State untuk form ulasan baru
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState('')

  const similar = product?.similarIds ? getProductsByIds(product.similarIds) : []
  const discount = savingsPercent(product.priceValue, product.oldPriceValue)

  function handleAddToCart() {
    onAddToCart(product.id, quantity)
  }

  function submitReview() {
    if (newRating === 0) return alert('Silakan pilih rating bintang terlebih dahulu.');
    if (!newComment.trim()) return alert('Silakan tulis komentar Anda.');
    
    onSendReview(newRating, newComment);
    setNewRating(0);
    setNewComment('');
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

        <div className="product-detail__tab-panel">
          {activeTab === 'description' && (
            <p>{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div style={{ padding: '10px 0', lineHeight: '1.8' }}>
              <p><strong>Kondisi Fisik:</strong> {product.score}</p>
              <p><strong>Status Hardware:</strong> {product.badge}</p>
              <p><strong>Kategori:</strong> {getCategoryLabel(product.category) || product.category}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={{ padding: '10px 0' }}>
              
              {/* Form Tulis Ulasan */}
              <div style={{ marginBottom: '30px', padding: '20px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#0d3b66' }}>Tulis Ulasan Anda</h3>
                
                {/* Pemilih Bintang */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      style={{ 
                        background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', 
                        color: star <= newRating ? '#ffc107' : '#e4e5e9', padding: 0, outline: 'none' 
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bagaimana kualitas produk ini?"
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', resize: 'vertical', fontFamily: 'inherit' }}
                />

                <button
                  type="button"
                  onClick={submitReview}
                  style={{ background: '#ff7f00', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  KIRIM ULASAN
                </button>
              </div>

              {/* Daftar Ulasan */}
              {reviews.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {reviews.map((rev, idx) => (
                    <li key={idx} style={{ padding: '15px', borderBottom: '1px solid #eee', marginBottom: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        {/* Menampilkan bintang sesuai rating */}
                        <span style={{ color: '#ffc107', fontSize: '1.2rem', letterSpacing: '2px' }}>
                          {'★'.repeat(rev.rating || 5)}{'☆'.repeat(5 - (rev.rating || 5))}
                        </span>
                        {/* Menampilkan nama pembeli dari database */}
                        <span style={{ margin: '0 0 0 10px', fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>
                          {rev.buyer_name || 'Pembeli'}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>"{rev.comment}"</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#666' }}>Belum ada ulasan pembeli untuk produk ini.</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ProductDetailPanel