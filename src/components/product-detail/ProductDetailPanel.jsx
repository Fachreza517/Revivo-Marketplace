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
  reviewState 
}) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [activeImage, setActiveImage] = useState(0)

  // Mengamankan fallback pencarian produk serupa dari localData lama agar tidak crash
  const similar = product?.similarIds ? getProductsByIds(product.similarIds) : []
  const discount = savingsPercent(product.priceValue, product.oldPriceValue)

  function handleAddToCart() {
    onAddToCart(product.id, quantity)
  }

  return (
    <div className="product-detail">
      {/* --- BREADCRUMB --- */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button type="button" onClick={() => onNavigate('landing')}>
          Home
        </button>
        <span aria-hidden="true"> / </span>
        <button type="button" onClick={() => onNavigate('shop', { category: product.category })}>
          {getCategoryLabel(product.category)}
        </button>
        <span aria-hidden="true"> / </span>
        <span>{product.name}</span>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="product-detail__hero">
        <div className="product-detail__gallery">
          <img
            className="product-detail__main-image"
            src={product.gallery[activeImage] ?? product.image}
            alt={product.name}
          />
          <div className="product-detail__thumbs">
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
        </div>

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
            <QuantityStepper
              value={quantity}
              min={1}
              max={product.stock}
              onChange={setQuantity}
            />
            <span className="product-detail__stock">Stok: {product.stock} unit</span>
          </div>

          <ProductSellerCard
            seller={product.seller}
            onChat={() => {
              if (product.sellerId && product.sellerId.startsWith('user-')) {
                onNavigate('chat', {
                  threadId: product.sellerId,
                  chatBootstrap: {
                    id: product.sellerId,
                    name: product.seller.shopName,
                    avatar: product.seller.avatar,
                    location: product.seller.location,
                    unread: 0,
                    online: true,
                    preview: 'Halo! Terima kasih sudah melihat listing saya.',
                    time: 'Baru',
                    messages: [
                      {
                        id: 'welcome',
                        sender: 'them',
                        text: 'Halo! Terima kasih sudah melihat listing saya. Ada yang ingin ditanyakan?',
                        time: 'Baru',
                      },
                    ],
                  },
                })
                return
              }
              onNavigate('chat', { threadId: product.sellerId || 'default-bot' })
            }}
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
              aria-selected={activeTab === tab.id || (tab.id === 'reviews' && activeTab === 'reviews')}
              className={activeTab === tab.id || (tab.id === 'reviews' && activeTab === 'reviews') ? 'active' : ''}
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
            {product.features && product.features.length > 0 && (
              <>
                <h2>Fitur Unggulan:</h2>
                <ul className="feature-list">
                  {product.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
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

        {/* 🌟 INTEGRASI TOTAL: Tab Ulasan/Review Gabungan Supabase */}
        {(activeTab === 'reviews' || activeTab === 'reviews') && (
          <div className="product-detail__tab-panel">
            
            {/* Form Input Komentar (Merender aman di dalam tab) */}
            {onSendReview && reviewState && (
              <form onSubmit={onSendReview} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #eee' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111' }}>Berikan Ulasan Kondisi Hardware</h3>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Nama Pemeriksa</span>
                    <input 
                      type="text" 
                      value={reviewState.reviewName} 
                      onChange={(e) => reviewState.setReviewName(e.target.value)} 
                      placeholder="Masukkan nama anda" 
                      required 
                      style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }}
                    />
                  </label>
                  
                  <label style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Skala Kepuasan</span>
                    <select 
                      value={reviewState.ratingInput} 
                      onChange={(e) => reviewState.setRatingInput(e.target.value)}
                      style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', fontSize: '0.9rem' }}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                      <option value="4">⭐⭐⭐⭐ (4)</option>
                      <option value="3">⭐⭐⭐ (3)</option>
                      <option value="2">⭐⭐ (2)</option>
                      <option value="1">⭐ (1)</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555' }}>Ulasan Fisik & Fungsionalitas</span>
                  <textarea 
                    value={reviewState.commentInput} 
                    onChange={(e) => reviewState.setCommentInput(e.target.value)} 
                    placeholder="Ceritakan kondisi kesehatan baterai (BH), fungsional tombol, atau goresan layar..." 
                    required 
                    rows={3}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit' }}
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={reviewState.submittingReview} 
                  style={{ background: '#f57c00', color: '#fff', border: '0', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                >
                  {reviewState.submittingReview ? 'MENGIRIMKAN...' : 'KIRIM REVIEW'}
                </button>
              </form>
            )}

            {/* List Riwayat Review dari Supabase */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              {reviews.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <strong style={{ color: '#222', fontSize: '1rem' }}>{rev.buyer_name}</strong>
                      <span style={{ color: '#ffb300' }}>{'⭐'.repeat(rev.rating)}</span>
                    </div>
                    <p style={{ margin: '0 0 6px 0', color: '#444', fontSize: '0.95rem', lineHeight: '1.4' }}>{rev.comment}</p>
                    <small style={{ color: '#999', fontSize: '0.8rem' }}>
                      {new Date(rev.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </small>
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
              <ProductCard 
                key={item.id} 
                product={item} 
                onSelect={(id) => onNavigate('product-detail', { productId: id })} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPanel