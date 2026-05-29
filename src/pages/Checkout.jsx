import StoreLayout from '../components/StoreLayout.jsx'
import { useCart } from '../context/CartContext.jsx'
// Import jembatan Supabase Client dan utilitas pemformatan angka jika diperlukan
import { supabase } from '../integrations/supabase/client.js'

function Checkout({ isAuthenticated, onNavigate }) {
  const { lines, totalLabel, itemCount, clearCart } = useCart()

  // SINKRONISASI PEMBUATAN NOTA PESANAN KE DATABASE SUPABASE
  async function finishOrder() {
    try {
      // 1. Dapatkan informasi pengguna aktif yang sedang melakukan checkout
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      // Jika pengguna login dan ada item di dalam keranjang, catat ke tabel orders
      if (authUser && lines && lines.length > 0) {
        
        // Buat data pesanan terpisah untuk setiap item yang ada di dalam keranjang
        const orderInserts = lines.map(line => {
          // Ambil harga asli produk, atau gunakan logika harga kustom jika ada kesepakatan
          const finalPrice = line.product.priceValue || 0
          
          return {
            listing_id: line.product.id,
            buyer_id: authUser.id,
            seller_id: line.product.sellerId || "00000000-0000-0000-0000-000000000000", // Fallback jika properti kosong
            agreed_price: finalPrice,
            quantity: parseInt(line.quantity || 1),
            status: 'pending_payment' // Status awal transaksi escrow REVIVO
          }
        })

        // Tembak data array pesanan sekaligus (Bulk Insert) ke cloud database
        const { error: orderError } = await supabase
          .from('orders')
          .insert(orderInserts)

        if (orderError) throw orderError

        // 2. Tandai produk tersebut sebagai 'sold' di tabel listings agar tidak muncul lagi di katalog Shop
        for (const line of lines) {
          await supabase
            .from('listings')
            .update({ status: 'sold' })
            .eq('id', line.product.id)
        }
      }
    } catch (err) {
      console.error('Gagal mencatat pesanan resmi ke cloud server:', err.message)
      // Tetap lanjutkan pembersihan halaman agar user-experience tidak tersangkut eror
    } finally {
      // --- Alur Pembersihan Toko Bawaan Frontend ---
      clearCart()
      onNavigate('landing')
    }
  }

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <div className="store-message checkout-done">
        <h1>Pesanan Berhasil!</h1>
        <p>
          Terima kasih. {itemCount} item dengan total {totalLabel} sedang diproses.
        </p>
        <button type="button" className="button button--orange" onClick={finishOrder}>
          Kembali ke Beranda
        </button>
      </div>
    </StoreLayout>
  )
}

export default Checkout