import { useEffect, useState } from 'react'
import ProductDetailPanel from '../components/product-detail/ProductDetailPanel.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
// Import jembatan Supabase Client
import { supabase } from '../integrations/supabase/client.js'

function ProductDetail({ productId, isAuthenticated, user, onNavigate }) {
  const { addItem } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [reviews, setReviews] = useState([])
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [reviewName, setReviewName] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const [isWishlisted, setIsWishlisted] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  const fetchProductAndReviews = async () => {
    if (!productId) return
    try {
      const { data: prodData, error: prodError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', productId)
        .single()

      if (prodError) throw prodError

      if (prodData) {
        const fallbackStoreName = `Toko Revivo ${prodData.location?.split(',')[0] || 'Gawai'}`
        
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
          tech_spec: prodData.tech_spec || 'Spesifikasi standar pabrik.',
          specs: [
            { label: 'Kategori Perangkat', value: (prodData.category || '').toUpperCase() },
            { label: 'Lokasi Unit', value: prodData.location || 'Indonesia' },
            { label: 'Detail Spesifikasi', value: prodData.tech_spec || 'Spesifikasi standar pabrik.' } 
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
    async function checkCurrentWishlist() {
      if (!productId || !user?.id) {
        setIsWishlisted(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', user.id)
          .eq('listing_id', productId)
          .maybeSingle()

        if (!error && data) {
          setIsWishlisted(true)
        } else {
          setIsWishlisted(false)
        }
      } catch (err) {
        console.error('Gagal membaca data wishlist:', err)
      }
    }

    checkCurrentWishlist()
  }, [productId, user])

  useEffect(() => {
    fetchProductAndReviews()
  }, [productId])

  async function handleSendReview(event) {
    event.preventDefault()
    if (!commentInput.trim() || !reviewName.trim()) return

    setSubmittingReview(true)
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{ listing_id: productId, buyer_name: reviewName.trim(), rating: parseInt(ratingInput), comment: commentInput.trim() }])

      if (error) throw error
      setCommentInput('')
      setReviewName('')
      await fetchProductAndReviews()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated || !user?.id) {
      alert('Silakan masuk ke akun Revivo Anda terlebih dahulu untuk menambahkan produk ke Wishlist!')
      onNavigate('login')
      return
    }

    if (togglingWishlist) return
    setTogglingWishlist(true)

    try {
      if (isWishlisted) {
        await supabase.from('wishlists').delete().eq('user_id', user.id).eq('listing_id', productId)
        setIsWishlisted(false)
      } else {
        await supabase.from('wishlists').insert([{ user_id: user.id, listing_id: productId }])
        setIsWishlisted(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingWishlist(false)
    }
  }

  function handleAddToCart(id, quantity) {
    if (!product) return
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
    addItem(productToCart, quantity)
    onNavigate('cart')
  }

  if (loading) {
    return (
      <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
        <div className="store-message"><p>Membaca dekripsi hardware & health check dari cloud...</p></div>
      </StoreLayout>
    )
  }

  if (!product) {
    return (
      <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
        <div className="store-message"><h1>Produk tidak ditemukan</h1></div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
      {/* CONTAINER FLOATING UNTUK TOMBOL EDIT KHUSUS PEMILIK SAH BARANG */}
      {user?.id && product?.sellerId && user.id === product.sellerId && (
        <div style={{ maxWidth: '1200px', margin: '20px auto -10px auto', padding: '0 20px' }}>
          <div style={{ background: '#fff3cd', border: '1px solid #ffeba2', padding: '15px 20px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#856404', fontWeight: '500' }}>🔒 Anda adalah pemilik sah iklan gawai ini.</span>
            <button type="button" onClick={() => onNavigate('edit-barang', { productId: product.id })} style={{ background: '#ff7f00', color: '#fff', border: '0', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              📝 EDIT DETAIL IKLAN
            </button>
          </div>
        </div>
      )}

      {/* 🌟 PENJELASAN 4: Blok container div tombol kapsul besar yang kemarin di sini sudah dihapus total */}

      <ProductDetailPanel 
        product={product} 
        onNavigate={onNavigate} 
        onAddToCart={handleAddToCart} 
        reviews={reviews}
        onSendReview={handleSendReview}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        togglingWishlist={togglingWishlist}
        reviewState={{ reviewName, setReviewName, ratingInput, setRatingInput, commentInput, setCommentInput, submittingReview }}
      />
    </StoreLayout>
  )
}

export default ProductDetail