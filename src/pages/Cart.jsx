import { useState } from 'react'
import QuantityStepper from '../components/QuantityStepper.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatRupiah } from '../utils/formatPrice.js'

function CartLine({ line, onQuantityChange, onRemove }) {
  const { product, quantity, lineTotal } = line

  // Fallback pengondisian jika tim frontend atau backend menggunakan nama properti berbeda untuk gambar
  const productImage = product.image || product.image_url || '/placeholder.svg'

  return (
    <article className="cart-line">
      {/* Diubah agar menggunakan variabel pengondisian gambar yang aman */}
      <img src={productImage} alt={product.name} className="cart-line__image" />
      <div className="cart-line__body">
        <h2>{product.name}</h2>
        <div className="cart-line__badges">
          <span className="score-badge">{product.score}</span>
          <span className="status-badge">{product.badge}</span>
        </div>
        <div className="cart-line__prices">
          <strong>{formatRupiah(lineTotal)}</strong>
          {product.oldPrice && <span>{product.oldPrice}</span>}
        </div>
        <div className="cart-line__controls">
          <QuantityStepper
            value={quantity}
            min={1}
            max={product.stock || 99}
            onChange={(next) => onQuantityChange(product.id, next)}
          />
          <button type="button" className="cart-line__remove" onClick={() => onRemove(product.id)}>
            Hapus
          </button>
        </div>
      </div>
    </article>
  )
}

function Cart({ isAuthenticated, onNavigate, onCheckout }) {
  const {
    lines,
    itemCount,
    subtotalLabel,
    totalLabel,
    savingsLabel,
    shippingLabel,
    setQuantity,
    removeItem,
  } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [promoMessage, setPromoMessage] = useState('')

  function applyPromo() {
    if (promoCode.trim().toUpperCase() === 'REVIVO10') {
      setPromoMessage('Kode REVIVO10 aktif — diskon ditampilkan di ringkasan.')
      return
    }
    setPromoMessage('Kode promo tidak valid.')
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="cart-page">
        <header className="cart-page__header">
          <h1>KERANJANG BELANJA</h1>
          <p>{itemCount} item dalam keranjang Anda</p>
        </header>

        {lines.length === 0 ? (
          <div className="store-message">
            <p>Keranjang masih kosong.</p>
            <button type="button" className="button button--orange" onClick={() => onNavigate('shop')}>
              LANJUT BELANJA
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-lines">
              {lines.map((line) => (
                <CartLine
                  key={line.productId}
                  line={line}
                  onQuantityChange={setQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <aside className="cart-summary">
              <h2>RINGKASAN PESANAN</h2>
              <dl>
                <div>
                  <dt>Subtotal ({itemCount} item)</dt>
                  <dd>{subtotalLabel}</dd>
                </div>
                <div>
                  <dt>Ongkir</dt>
                  <dd>{shippingLabel}</dd>
                </div>
                <div className="cart-summary__total">
                  <dt>Total</dt>
                  <dd>{totalLabel}</dd>
                </div>
              </dl>
              <p className="cart-summary__note">Sudah termasuk PPN</p>
              <p className="cart-summary__savings">Anda hemat {savingsLabel}</p>

              <button type="button" className="button button--checkout" onClick={onCheckout}>
                CHECKOUT
              </button>
              <button type="button" className="button button--outline" onClick={() => onNavigate('shop')}>
                LANJUT BELANJA
              </button>

              <div className="cart-promo">
                <h3>KODE PROMO</h3>
                <div className="cart-promo__row">
                  <input
                    type="text"
                    placeholder="Masukkan kode promo"
                    value={promoCode}
                    onChange={(event) => setPromoCode(event.target.value)}
                  />
                  <button type="button" onClick={applyPromo}>
                    PAKAI
                  </button>
                </div>
                {promoMessage && <p className="cart-promo__message">{promoMessage}</p>}
              </div>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  )
}

export default Cart