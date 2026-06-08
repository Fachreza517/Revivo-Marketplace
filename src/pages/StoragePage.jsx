import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { supabase } from '../integrations/supabase/client.js'

function StorePage({ sellerId, isAuthenticated, onNavigate }) {
  const [sellerProfile, setSellerProfile] = useState(null)
  const [storeProducts, setStoreProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStoreData() {
      if (!sellerId) return
      setLoading(true)
      try {
        // 1. Tarik profil penjual secara Live
        const { data: profData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sellerId)
          .maybeSingle()
          
        if (profData) {
          setSellerProfile({
            storeName: profData.username || profData.full_name || 'Toko Tanpa Nama',
            ownerName: profData.full_name || 'Pengguna',
            avatar: profData.avatar_url || null,
            location: profData.address ? profData.address.split(',').slice(-2).join(', ').trim() : 'Indonesia',
            joined: new Date(profData.created_at || Date.now()).getFullYear()
          })
        } else {
          // Fallback jika penjual belum mengatur profil
          setSellerProfile({ storeName: 'Toko Revivo', ownerName: 'Penjual', avatar: null, location: 'Indonesia', joined: 'Baru saja' })
        }

        // 2. Tarik daftar jualan mereka (hanya yang statusnya 'available')
        const { data: productsData } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', sellerId)
          .eq('status', 'available')
          .order('created_at', { ascending: false })

        if (productsData) {
          setStoreProducts(productsData.map(item => ({
            id: item.id,
            name: item.name,
            price: `Rp ${Number(item.price_value).toLocaleString('id-ID')}`,
            oldPrice: item.old_price_value ? `Rp ${Number(item.old_price_value).toLocaleString('id-ID')}` : '',
            badge: item.badge,
            score: item.score,
            image: item.image_url || '/placeholder.svg'
          })))
        }
      } catch (err) {
        console.error('Gagal memuat halaman toko:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStoreData()
  }, [sellerId])

  if (loading) {
    return (
      <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate}>
        <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>Memuat profil toko penjual...</div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        
        {/* HEADER PROFIL TOKO */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '30px', display: 'flex', alignItems: 'center', gap: '25px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '40px' }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2.5rem', fontWeight: 'bold', flexShrink: 0 }}>
            {sellerProfile.avatar ? (
              <img src={sellerProfile.avatar} alt={sellerProfile.storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              sellerProfile.storeName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem', color: '#0f172a' }}>{sellerProfile.storeName}</h1>
            <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: '1rem' }}>Dikelola oleh @{sellerProfile.ownerName}</p>
            <div style={{ display: 'flex', gap: '20px', color: '#334155', fontSize: '0.95rem', fontWeight: '500' }}>
              <span>📍 {sellerProfile.location}</span>
              <span>📦 {storeProducts.length} Produk Aktif</span>
              <span>⭐ Bergabung sejak {sellerProfile.joined}</span>
            </div>
          </div>
        </div>

        {/* ETALASE PRODUK PENJUAL (READ-ONLY) */}
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '20px', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', display: 'inline-block' }}>
          Etalase Gawai
        </h2>
        
        {storeProducts.length === 0 ? (
          <div style={{ background: '#f8fafc', padding: '40px', textAlign: 'center', borderRadius: '8px', color: '#64748b', border: '1px dashed #cbd5e1' }}>
            Toko ini sedang tidak memiliki produk aktif yang dijual.
          </div>
        ) : (
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {storeProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={(id) => onNavigate('product-detail', { productId: id })} 
              />
            ))}
          </div>
        )}

      </div>
    </StoreLayout>
  )
}

export default StorePage