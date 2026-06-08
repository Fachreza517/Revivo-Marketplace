import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Bandingkan({ isAuthenticated, onNavigate }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [product1, setProduct1] = useState(null)
  const [product2, setProduct2] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Ambil data wishlist user
  useEffect(() => {
    async function fetchWishlist() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('wishlists')
        .select(`listings ( id, name, price_value, category, score, image_url )`)
        .eq('user_id', user.id)

      if (data) {
        // Flatten data agar lebih mudah diakses di dropdown
        const items = data.filter(d => d.listings).map(d => d.listings)
        setWishlistItems(items)
      }
      setLoading(false)
    }
    fetchWishlist()
  }, [])

  const SelectProduct = ({ selected, onChange, label }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{label}:</label>
      <select 
        value={selected?.id || ''} 
        onChange={(e) => onChange(wishlistItems.find(i => i.id === e.target.value))}
        style={{ width: '100%', padding: '10px', borderRadius: '4px' }}
      >
        <option value="">-- Pilih Produk dari Wishlist --</option>
        {wishlistItems.map(item => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </div>
  )

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px' }}>BANDINGKAN PERANGKAT</h1>
        
        {loading ? <p>Memuat wishlist...</p> : (
          <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: 1 }}><SelectProduct selected={product1} onChange={setProduct1} label="Produk Pertama" /></div>
            <div style={{ flex: 1 }}><SelectProduct selected={product2} onChange={setProduct2} label="Produk Kedua" /></div>
          </div>
        )}

        {product1 && product2 ? (
          <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#0d3b66', color: '#fff' }}>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>Kriteria</th>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>{product1.name}</th>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>{product2.name}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Kondisi Fisik', key: 'score' },
                { label: 'Kategori', key: 'category' },
                { label: 'Harga', key: 'price_value' }
              ].map(row => (
                <tr key={row.key}>
                  <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9' }}>{row.label}</td>
                  <td style={{ padding: '12px', border: '1px solid #ccc' }}>{product1[row.key]}</td>
                  <td style={{ padding: '12px', border: '1px solid #ccc' }}>{product2[row.key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: '20px', color: '#666' }}>Silakan pilih 2 produk dari wishlist di atas untuk memulai perbandingan.</p>
        )}
      </div>
    </StoreLayout>
  )
}

export default Bandingkan