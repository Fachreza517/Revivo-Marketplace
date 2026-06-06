import { useEffect, useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { supabase } from '../integrations/supabase/client.js'

function Bandingkan({ isAuthenticated, onNavigate }) {
  const [compareItems, setCompareItems] = useState([])

  useEffect(() => {
    async function fetchCompareProducts() {
      // Ambil 2 produk teratas dari database cloud untuk simulasi perbandingan
      const { data } = await supabase.from('listings').select('*').limit(2)
      if (data) setCompareItems(data)
    }
    fetchCompareProducts()
  }, [])

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: '#0d3b66', borderBottom: '2px solid #ff7f00', paddingBottom: '10px', fontSize: '1.8rem' }}>BANDINGKAN PERANGKAT</h1>
        
        {compareItems.length < 2 ? (
          <p style={{ marginTop: '20px', fontStyle: 'italic' }}>Membutuhkan minimal 2 produk di database cloud untuk melakukan komparasi hardware...</p>
        ) : (
          <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse', textAlign: 'center' }}>
            <thead>
              <tr style={{ background: '#0d3b66', color: '#fff' }}>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>Kriteria Hardware</th>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>{compareItems[0].name}</th>
                <th style={{ padding: '12px', border: '1px solid #ccc' }}>{compareItems[1].name}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9' }}>Kondisi Fisik</td>
                <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', color: 'green' }}>{compareItems[0].score}</td>
                <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', color: 'green' }}>{compareItems[1].score}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9' }}>Kategori</td>
                <td style={{ padding: '12px', border: '1px solid #ccc' }}>{compareItems[0].category.toUpperCase()}</td>
                <td style={{ padding: '12px', border: '1px solid #ccc' }}>{compareItems[1].category.toUpperCase()}</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', border: '1px solid #ccc', fontWeight: 'bold', background: '#f9f9f9' }}>Harga Batam/Cloud</td>
                <td style={{ padding: '12px', border: '1px solid #ccc', color: '#ff7f00', fontWeight: 'bold' }}>Rp {Number(compareItems[0].price_value).toLocaleString('id-ID')}</td>
                <td style={{ padding: '12px', border: '1px solid #ccc', color: '#ff7f00', fontWeight: 'bold' }}>Rp {Number(compareItems[1].price_value).toLocaleString('id-ID')}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </StoreLayout>
  )
}

export default Bandingkan