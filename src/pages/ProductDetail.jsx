import { useEffect, useState } from 'react'
import ProductDetailPanel from '../components/product-detail/ProductDetailPanel.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
import { supabase } from '../integrations/supabase/client.js'

// Fungsi bantu untuk menghitung diskon
const calculateDiscount = (price, oldPrice) => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
};

function ProductDetail({ productId, isAuthenticated, user, onNavigate }) {
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [togglingWishlist, setTogglingWishlist] = useState(false)

  const fetchProductAndReviews = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const { data: prodData, error: prodError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', productId)
        .single()

      if (prodError) throw prodError

      if (prodData) {
        let sellerProfile = null;
        if (prodData.seller_id) {
          const { data } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url, address')
            .eq('id', prodData.seller_id)
            .maybeSingle();
          sellerProfile = data;
        }

        // Hitung diskon
        const priceVal = Number(prodData.price_value);
        const oldPriceVal = Number(prodData.old_price_value || 0);
        const discountPercent = calculateDiscount(priceVal, oldPriceVal);

        setProduct({
          id: prodData.id,
          name: prodData.name,
          description: prodData.description,
          priceValue: priceVal,
          oldPriceValue: oldPriceVal, // Kirim ini ke Panel untuk perhitungan di sana
          discountPercent: discountPercent, // 🌟 Mengirim persentase diskon
          price: `Rp ${priceVal.toLocaleString('id-ID')}`,
          oldPrice: oldPriceVal > 0 ? `Rp ${oldPriceVal.toLocaleString('id-ID')}` : '',
          image: prodData.image_url || '/placeholder.svg',
          gallery: prodData.image_url ? [prodData.image_url] : ['/placeholder.svg'],
          stock: prodData.stock,
          badge: prodData.badge,
          score: prodData.score,
          sellerId: prodData.seller_id,
          seller: {
            name: sellerProfile?.full_name || 'Penjual',
            shopName: sellerProfile?.username || 'Toko Tanpa Nama',
            avatar: sellerProfile?.avatar_url || null,
            location: prodData.location || 'Indonesia'
          }
        })
      }
    } catch (err) {
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleWishlist() {
    if (!isAuthenticated || !user?.id) {
      alert('Silakan masuk untuk menggunakan fitur Wishlist!')
      onNavigate('login')
      return
    }
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

  useEffect(() => {
    fetchProductAndReviews()
    async function checkWishlist() {
      if (!productId || !user?.id) return
      const { data } = await supabase.from('wishlists').select('id').eq('user_id', user.id).eq('listing_id', productId).maybeSingle()
      setIsWishlisted(!!data)
    }
    checkWishlist()
  }, [productId, user])

  if (loading) return <StoreLayout><p>Memuat...</p></StoreLayout>
  if (!product) return <StoreLayout><h1>Produk tidak ditemukan</h1></StoreLayout>

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
      <ProductDetailPanel 
        product={product} 
        onNavigate={onNavigate} 
        onContactSeller={() => onNavigate('chat')}
        isWishlisted={isWishlisted}
        onToggleWishlist={handleToggleWishlist}
        togglingWishlist={togglingWishlist}
      />
    </StoreLayout>
  )
}
export default ProductDetail