import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Wishlist({ isAuthenticated, onNavigate }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWishlist() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('wishlists')
          .select(`
            id,
            listings ( id, name, price_value, image_url, score, badge )
          `)
          .eq('user_id', user.id)

        if (!error && data) setWishlistItems(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [])

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', fontSize: '1.8rem' }}>DAFTAR KEINGINAN (WISHLIST)</h1>
        
        {loading ? (
          <p>Membaca daftar keinginan dari cloud...</p>
        ) : wishlistItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '50px' }}>
            <p style={{ color: '#666', fontSize: '1.1rem', fontStyle: 'italic' }}>Belum ada gawai impian yang kamu simpan.</p>
            <button 
              onClick={() => onNavigate('shop')}
              style={{ background: '#ff7f00', color: '#fff', border: '0', padding: '12px 24px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}
            >
              CARI GADGET SEKARANG
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '25px' }}>
            {wishlistItems.map((item) => {
              const prod = item.listings
              if (!prod) return null
              return (
                <div key={item.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', background: '#fff', textAlign: 'center' }}>
                  <img src={prod.image_url || '/placeholder.svg'} alt="" style={{ height: '140px', objectFit: 'contain', marginBottom: '10px' }} />
                  <h3 style={{ fontSize: '1rem', margin: '5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</h3>
                  <p style={{ color: '#ff7f00', fontWeight: 'bold', margin: '5px 0' }}>Rp {Number(prod.price_value).toLocaleString('id-ID')}</p>
                  <button 
                    onClick={() => onNavigate('product-detail', { productId: prod.id })}
                    style={{ background: '#0d3b66', color: '#fff', width: '100%', border: '0', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold', fontSize: '0.85rem' }}
                  >
                    LIHAT DETAIL
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </StoreLayout>
  )
}

export default Wishlist