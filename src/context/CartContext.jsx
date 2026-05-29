import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { formatRupiah } from '../utils/formatPrice.js'

// Definisikan ongkos kirim standar rupiah (menggantikan konstanta localData)
const SHIPPING_FEE = 15000
const CART_STORAGE_KEY = 'revivo-cart'

const CartContext = createContext(null)

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart)

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // PERBAIKAN UTAMA: Mengabaikan getProductById dan langsung membaca payload objek utuh dari state items
  const lines = useMemo(
    () =>
      items
        .map((line) => {
          const product = line.product
          if (!product) return null
          
          const maxStock = product.stock || 99
          const quantity = Math.max(1, Math.min(line.quantity, maxStock))
          const currentPrice = Number(product.priceValue || 0)
          const oldPrice = Number(product.oldPriceValue || currentPrice)

          return {
            productId: line.productId,
            product,
            quantity,
            lineTotal: currentPrice * quantity,
            lineSavings: (oldPrice - currentPrice) * quantity,
          }
        })
        .filter(Boolean),
    [items],
  )

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const totalSavings = lines.reduce((sum, line) => sum + line.lineSavings, 0)
  const total = subtotal + (lines.length ? SHIPPING_FEE : 0)

  // PERBAIKAN: Fungsi menerima objek product utuh dari ProductDetail.jsx agar mandiri dari data lokal
  function addItem(product, quantity = 1) {
    if (!product) return
    const targetId = product.id || product.productId

    setItems((current) => {
      const existing = current.find((line) => line.productId === targetId)
      const maxStock = product.stock || 99

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxStock)
        return current.map((line) =>
          line.productId === targetId ? { ...line, quantity: nextQty } : line,
        )
      }
      
      // Simpan productId bersama struktur objek product utuh ke dalam LocalStorage
      return [
        ...current, 
        { 
          productId: targetId, 
          quantity: Math.min(quantity, maxStock),
          product: {
            id: targetId,
            name: product.name,
            priceValue: Number(product.priceValue || 0),
            oldPriceValue: Number(product.oldPriceValue || 0),
            image: product.image || '/placeholder.svg',
            badge: product.badge || 'BEKAS',
            score: product.score || '90%',
            stock: maxStock
          }
        }
      ]
    })
  }

  function setQuantity(productId, quantity) {
    const existingItem = items.find((line) => line.productId === productId)
    if (!existingItem) return

    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    const maxStock = existingItem.product?.stock || 99
    const nextQty = Math.min(quantity, maxStock)
    
    setItems((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity: nextQty } : line)),
    )
  }

  function removeItem(productId) {
    setItems((current) => current.filter((line) => line.productId !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const value = {
    lines,
    itemCount,
    subtotal,
    totalSavings,
    shippingFee: SHIPPING_FEE,
    total,
    subtotalLabel: formatRupiah(subtotal),
    totalLabel: formatRupiah(total),
    savingsLabel: formatRupiah(totalSavings),
    shippingLabel: formatRupiah(SHIPPING_FEE),
    addItem,
    setQuantity,
    removeItem,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}