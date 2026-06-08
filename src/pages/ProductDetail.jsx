import { useEffect, useState } from 'react'
import ProductDetailPanel from '../components/product-detail/ProductDetailPanel.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
import { supabase } from '../integrations/supabase/client.js'

function ProductDetail({ productId, isAuthenticated, user, onNavigate }) {
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

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
        // Tarik data profil penjual yang asli
        let sellerProfile = null;
        if (prodData.seller_id) {
          const { data } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url, address')
            .eq('id', prodData.seller_id)
            .maybeSingle();
          sellerProfile = data;
        }

        setProduct({
          id: prodData.id,
          name: prodData.name,
          description: prodData.description,
          priceValue: Number(prodData.price_value),
          price: `Rp ${Number(prodData.price_value).toLocaleString('id-ID')}`,
          oldPrice: prodData.old_price_value ? `Rp ${Number(prodData.old_price_value).toLocaleString('id-ID')}` : '',
          image: prodData.image_url || '/placeholder.svg',
          gallery: prodData.image_url ? [prodData.image_url] : ['/placeholder.svg'],
          stock: prodData.stock,
          badge: prodData.badge,
          score: prodData.score,
          sellerId: prodData.seller_id,
          seller: {
            // Data diambil murni dari profil, tanpa penggabungan kata "Toko Revivo"
            name: sellerProfile?.full_name || 'Penjual',
            shopName: sellerProfile?.username || 'Toko Tanpa Nama',
            avatar: sellerProfile?.avatar_url || null,
            location: prodData.location || 'Indonesia' 
          }
        })
      }
    } catch (err) {
      console.error(err)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProductAndReviews() }, [productId])

  if (loading) return <StoreLayout><p>Memuat...</p></StoreLayout>
  if (!product) return <StoreLayout><h1>Produk tidak ditemukan</h1></StoreLayout>

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
      <ProductDetailPanel 
        product={product} 
        onNavigate={onNavigate} 
        onContactSeller={() => onNavigate('chat')}
      />
    </StoreLayout>
  )
}
export default ProductDetail