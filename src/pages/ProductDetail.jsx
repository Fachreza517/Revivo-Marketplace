import { useEffect, useState } from 'react'
import ProductDetailPanel from '../components/product-detail/ProductDetailPanel.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
// Import jembatan Supabase Client
import { supabase } from '../integrations/supabase/client.js'

function ProductDetail({ productId, isAuthenticated, onNavigate }) {
  const { addItem } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // State manajemen ulasan dari basis data Supabase
  const [reviews, setReviews] = useState([])
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // FUNGSI UTAMA UNTUK MENARIK DATA PRODUK & LIST REVIEWS SECARA BERSAMAAN
  const fetchProductAndReviews = async () => {
    if (!productId) return
    try {
      // 1. Ambil spesifikasi detail produk dari tabel listings
      const { data: prodData, error: prodError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', productId)
        .single()

      if (prodError) throw prodError

      if (prodData) {
        const fallbackStoreName = `Toko Revivo ${prodData.location.split(',')[0] || 'Gawai'}`
        
        setProduct({
          id: prodData.id,
          name: prodData.name,
          description: prodData.description,
          category: prodData.category,
          badge: prodData.badge,
          score: prodData.score,
          priceValue: Number(prodData.price_value),
          price: `Rp ${Number(prodData.price_value).toLocaleString('id-ID')}`,
          oldPrice: prodData.old_price_value ? `Rp ${Number(prodData.old_price_value).toLocaleString('id-ID')}` : '',
          oldPriceValue: prodData.old_price_value ? Number(prodData.old_price_value) : 0,
          stock: prodData.stock,
          location: prodData.location,
          image: prodData.image_url || '/placeholder.svg',
          gallery: prodData.image_url ? [prodData.image_url] : ['/placeholder.svg'],
          features: [],
          specs: [
            { label: 'Kategori Perangkat', value: prodData.category.toUpperCase() },
            { label: 'Lokasi Unit', value: prodData.location }
          ],
          sellerId: prodData.seller_id,
          seller: {
            name: fallbackStoreName,
            shopName: fallbackStoreName,
            avatar: null,
            location: prodData.location
          }
        })
      }

      // 2. Ambil seluruh daftar ulasan dari tabel reviews khusus untuk produk ini
      const { data: revData, error: revError } = await supabase
        .from('reviews')
        .select('*')
        .eq('listing_id', productId)
        .order('created_at', { ascending: false })

      if (!revError && revData) {
        setReviews(revData)
      }

    } catch (err) {
      console.error('Gagal menyelaraskan detail produk & ulasan:', err.message)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductAndReviews()
  }, [productId])

  // FUNGSI UNTUK MENGIRIM ULASAN BARU KE CLOUD SERVER
  async function handleSendReview(event) {
    event.preventDefault()
    if (!commentInput.trim() || !reviewName.trim()) return

    setSubmittingReview(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([
          {
            listing_id: productId,
            buyer_name: reviewName.trim(),
            rating: parseInt(ratingInput),
            comment: commentInput.trim()
          }
        ])

      if (error) throw error

      // Reset ulang kolom isian form setelah data masuk database
      setCommentInput('')
      setReviewName('')
      
      // Sinkronisasi ulang layar agar review baru langsung muncul tanpa hard-refresh
      await fetchProductAndReviews()

    } catch (err) {
      console.error('Gagal mencatat ulasan baru ke server:', err.message)
    } finally {
      setSubmittingReview(false)
    }
  }

  // FUNGSI HANDLER UNTUK TOMBOL TAMBAH KE KERANJANG
  function handleAddToCart(id, quantity) {
    if (!product) return

    // Membuat struktur objek terstandardisasi agar dipahami 100% oleh CartContext frontend
    const productToCart = {
      id: product.id,
      productId: product.id, 
      name: product.name,
      priceValue: product.priceValue,
      oldPriceValue: product.oldPriceValue,
      image: product.image,
      stock: product.stock,
      badge: product.badge,
      score: product.score
    }

    // Jalankan fungsi context dengan mengirimkan objek data utuh produk beserta quantity-nya
    addItem(productToCart, quantity)
    
    // Alihkan navigasi langsung ke halaman Cart belanja
    onNavigate('cart')
  }

  if (loading) {
    return (
      <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
        <div className="store-message">
          <p>Membaca dekripsi hardware & health check dari cloud...</p>
        </div>
      </StoreLayout>
    )
  }

  if (!product) {
    return (
      <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
        <div className="store-message">
          <h1>Produk tidak ditemukan</h1>
          <button type="button" className="button button--orange" onClick={() => onNavigate('shop')}>
            Kembali ke Belanja
          </button>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
      {/* Salurkan seluruh data produk, list ulasan, dan fungsinya masuk sebagai props ke komponen panel */}
      <ProductDetailPanel 
        product={product} 
        onNavigate={onNavigate} 
        onAddToCart={handleAddToCart} 
        reviews={reviews}
        onSendReview={handleSendReview}
        reviewState={{
          reviewName,
          setReviewName,
          ratingInput,
          setRatingInput,
          commentInput,
          setCommentInput,
          submittingReview
        }}
      />
    </StoreLayout>
  )
}

export default ProductDetail