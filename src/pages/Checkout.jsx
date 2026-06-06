import { useState } from 'react'
import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
// Import jembatan Supabase Client
import { supabase } from '../integrations/supabase/client.js'

// Import langsung aset gambar logo orisinal yang diunggah oleh Fachreza
import imgVisa from '../assets/gambar-visa.png'
import imgMaster from '../assets/gambar-mastercard.png'
import imgBca from '../assets/gambar-bca.png'
import imgOvo from '../assets/gambar-ovo.png'
import imgGopay from '../assets/gambar-gopay.png'

const METHOD_OPTIONS = [
  { id: 'VISA', label: 'Kartu Kredit VISA', img: imgVisa },
  { id: 'MASTER', label: 'Kartu Mastercard', img: imgMaster },
  { id: 'BCA', label: 'BCA Virtual Account', img: imgBca },
  { id: 'OVO', label: 'E-Wallet OVO', img: imgOvo },
  { id: 'GOPAY', label: 'E-Wallet GoPay', img: imgGopay },
]

function Checkout({ isAuthenticated, onNavigate }) {
  const { lines, totalLabel, itemCount, clearCart } = useCart()
  
  // State mencatat opsi pembayaran pilihan pengguna secara live
  const [selectedPayment, setSelectedPayment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // SINKRONISASI PEMBUATAN NOTA PESANAN & PENGURANGAN STOK DI SUPABASE
  async function finishOrder(event) {
    event.preventDefault()

    if (!selectedPayment) {
      alert('Peringatan: Silakan tentukan metode pembayaran gawai Anda terlebih dahulu!')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Dapatkan informasi pengguna aktif
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser && lines && lines.length > 0) {
        
        // Buat data pesanan untuk tabel orders
        const orderInserts = lines.map(line => {
          const nomorResiOtomatis = `REV-2026-${Math.floor(10000 + Math.random() * 90000)}`
          const finalPrice = line.product.priceValue || 0
          
          return {
            buyer_id: authUser.id,
            listing_id: line.product.id,
            resi_number: nomorResiOtomatis,
            tracking_status: 'Pesanan Dibuat', // Status Default Awal
            shipping_address: 'Jl. Pahlawan No. 10, Kota Semarang, Jawa Tengah, 50131, Indonesia',
            total_price: finalPrice * parseInt(line.quantity || 1),
            // Rekam metode pembayaran ke database Supabase
            payment_method: selectedPayment 
          }
        })

        // Tembak data array pesanan ke cloud database
        const { error: orderError } = await supabase
          .from('orders')
          .insert(orderInserts)

        if (orderError) throw orderError

        // 2. LOGIKA MATEMATIKA PENGURANGAN STOK DINAMIS DI CLOUD
        for (const line of lines) {
          const buyQty = parseInt(line.quantity || 1)
          const currentStock = parseInt(line.product.stock || 0)
          const nextStock = Math.max(0, currentStock - buyQty) // Hitung sisa stok baru

          // Tentukan status berdasarkan sisa stok
          const nextStatus = nextStock === 0 ? 'sold' : 'available'

          // Update data stok dan status terbaru langsung ke Supabase Cloud
          const { error: stockError } = await supabase
            .from('listings')
            .update({ 
              stock: nextStock,
              status: nextStatus 
            })
            .eq('id', line.product.id)

          if (stockError) console.error('Gagal update stok barang:', stockError.message)
        }

        alert(`Pembayaran Sukses Menggunakan ${selectedPayment}!\nNota pesanan resmi tercatat dan sisa kuantitas stok gawai berhasil dikurangi di cloud server!`)
        
        // Bersihkan keranjang, lalu alihkan langsung ke halaman pelacakan kurir
        clearCart()
        onNavigate('lacak-pesanan')
        return 

      } else {
        alert('Keranjang kosong atau sesi login habis.')
        onNavigate('shop')
      }
    } catch (err) {
      console.error('Gagal mencatat pesanan resmi ke cloud server:', err.message)
      alert('Gagal memproses checkout cloud: ' + err.message)
      clearCart()
      onNavigate('landing')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="checkout-page" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'inherit' }}>
        <h1 style={{ color: '#0d3b66', fontSize: '1.8rem', fontWeight: '800', marginBottom: '25px', textAlign: 'center' }}>
          METODE PEMBAYARAN ESCROW
        </h1>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* SISI KIRI: PANEL SELEKSI GERBANG PEMBAYARAN DENGAN LOGO */}
          <div style={{ flex: '1 1 500px', background: '#ffffff', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#334155', marginBottom: '15px' }}>
              Pilih Instrumen Pembayaran Aman Anda:
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {METHOD_OPTIONS.map((item) => {
                const isActive = selectedPayment === item.id
                return (
                  <label
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 20px',
                      border: isActive ? '2px solid #ff7f00' : '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: isActive ? '#fffbfe' : '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input 
                        type="radio" 
                        name="revivo_payment"
                        value={item.id}
                        checked={isActive}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                        style={{ width: '18px', height: '18px', accentColor: '#ff7f00' }}
                      />
                      <span style={{ fontSize: '0.95rem', fontWeight: isActive ? '700' : '500', color: '#1e293b' }}>
                        {item.label}
                      </span>
                    </div>

                    {/* Render visual gambar beresolusi pas di sisi ujung kanan radio */}
                    <img 
                      src={item.img} 
                      alt={item.id} 
                      style={{ height: '24px', width: '45px', objectFit: 'contain' }} 
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* SISI KANAN: PANEL REKAPITULASI NOTA FINANSIAL */}
          <div style={{ flex: '1 1 350px', background: '#455a9f', color: '#ffffff', padding: '25px', borderRadius: '8px', height: 'fit-content' }}>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px', fontWeight: '700' }}>
              RINGKASAN ORDER
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Jumlah Gawai</span>
                <span>{itemCount} Unit</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '12px' }}>
                <span>Ongkos Kirim JNE Cargo</span>
                <span>Rp 15.000</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', marginTop: '10px' }}>
                <span>Total Biaya</span>
                <span style={{ color: '#ffffff' }}>{totalLabel}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting || lines?.length === 0}
              onClick={finishOrder}
              style={{
                width: '100%',
                background: '#ff7f00',
                color: '#ffffff',
                border: '0',
                padding: '14px 0',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                cursor: (isSubmitting || lines?.length === 0) ? 'not-allowed' : 'pointer',
                marginTop: '25px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { if(!isSubmitting) e.currentTarget.style.background = '#e06f00' }}
              onMouseOut={(e) => { if(!isSubmitting) e.currentTarget.style.background = '#ff7f00' }}
            >
              {isSubmitting ? 'SEDANG MEMVERIFIKASI...' : 'KONFIRMASI PEMBAYARAN'}
            </button>
          </div>

        </div>
      </div>
    </StoreLayout>
  )
}

export default Checkout