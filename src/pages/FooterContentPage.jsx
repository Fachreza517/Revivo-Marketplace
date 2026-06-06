import StoreLayout from '../components/StoreLayout.jsx'

function FooterContentPage({ contentType, isAuthenticated, onNavigate }) {
  
  // 🌟 DATABASE INTERNAL: Kumpulan Informasi Resmi Startup REVIVO Kelompokmu
  const getContentData = () => {
    switch (contentType) {
      case 'tentang-kami':
        return {
          title: 'TENTANG KAMI — STARTUP REVIVO',
          subtitle: 'Merevolusi Cara Anda Membeli Elektronik Bekas Berkualitas.',
          body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <p>
                <strong>REVIVO</strong> adalah platform marketplace <em>re-commerce</em> elektronik bekas terdepan di Indonesia. 
                Kami hadir sebagai solusi siber hijau untuk mengurangi limbah elektronik (<em>e-waste</em>) nasional sekaligus memberikan 
                akses gawai pintar berkualitas premium dengan harga yang jauh lebih ramah di kantong.
              </p>
              <h3 style={{ color: '#ff7f00', marginTop: '10px' }}>Mengapa Memilih REVIVO?</h3>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Sistem Skor Kondisi Fisik Akurat:</strong> Setiap gawai diinspeksi secara ketat dan diberikan skor riil (95%, 90%, 85%) agar pembeli tahu kondisi hardware yang sebenarnya sebelum membayar.</li>
                <li><strong>Keamanan Transaksi Berlapis:</strong> Didukung oleh arsitektur cloud server Supabase dan enkripsi Row Level Security (RLS) untuk menjamin data pribadi serta uang Anda 100% aman.</li>
                <li><strong>Ekosistem Penjual Terpercaya:</strong> Kami memvalidasi kepemilikan sah setiap listing iklan gawai untuk mencegah penipuan barang tiruan atau barang ilegal di internet.</li>
              </ul>
            </div>
          )
        }

      case 'cara-kerja':
        return {
          title: 'PANDUAN CARA KERJA PLATFORM',
          subtitle: 'Transaksi Transparan, Mudah, dan Instan dari Rumah.',
          body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#0d3b66', marginBottom: '8px' }}>🛍️ Alur Untuk Pembeli:</h3>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li>Cari perangkat laptop, tablet, atau handphone impian Anda di halaman katalog utama <strong>Shop</strong>.</li>
                  <li>Gunakan filter harga cerdas tanpa batas (*Infinity price range*) untuk menemukan gawai yang pas dengan modal anggaran Anda.</li>
                  <li>Masukkan gawai ke keranjang belanja, isi kartu alamat pengiriman, lakukan checkout, dan pantau status pesanan secara langsung.</li>
                </ol>
              </div>
              <div>
                <h3 style={{ color: '#0d3b66', marginBottom: '8px' }}>📦 Alur Untuk Penjual (Merchant):</h3>
                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <li>Masuk ke dasbor profil pribadi Anda, lalu klik menu navigasi <strong>Jual Produk</strong>.</li>
                  <li>Masukkan foto pratinjau gawai, rincian harga, kuantitas stok, lokasi toko, serta spesifikasi teknis komponen secara bebas.</li>
                  <li>Kelola status listing iklan Anda secara mandiri (bisa diperbarui detailnya, disembunyikan sementara, atau dihapus permanen dari server database).</li>
                </ol>
              </div>
            </div>
          )
        }

      case 'syarat-ketentuan':
        return {
          title: 'SYARAT & KETENTUAN PENGGUNAAN',
          subtitle: 'Aturan Hukum dan Kebijakan Bertransaksi Keuangan di REVIVO.',
          body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>Dengan mengakses, mendaftarkan akun, dan bertransaksi di dalam platform startup REVIVO, Anda menyatakan setuju pada poin-poin hukum berikut:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Validitas Kepemilikan Barang:</strong> Penjual dilarang keras mengunggah iklan gawai hasil tindakan kriminal, replika (HDC), atau barang rusak total. Pelanggaran berat akan mengakibatkan akun diblokir oleh admin siber.</li>
                <li><strong>Akurasi Deskripsi:</strong> Penjual wajib mengisi tingkat persentase skor fisik perangkat sesuai dengan keadaan kesehatan hardware asli (kesehatan baterai, fungsionalitas tombol, dan minus goresan layar).</li>
                <li><strong>Kebijakan Finansial:</strong> Nilai nominal harga gawai yang tertera di aplikasi adalah mutlak dan belum termasuk beban biaya ongkos kirim kurir logistik.</li>
              </ul>
            </div>
          )
        }

      case 'kebijakan-privasi':
        return {
          title: 'KEBIJAKAN PRIVASI DATA SIBER',
          subtitle: 'Bagaimana Kami Menjaga Keamanan Data Enkripsi Akun Anda.',
          body: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p>Startup REVIVO berkomitmen penuh dalam melindungi kerahasiaan privasi data kelompok pengguna kami di internet:</p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Enkripsi Autentikasi:</strong> Seluruh sistem pendaftaran akun baru (Sign Up) dan autentikasi masuk (Login) diproteksi langsung secara live menggunakan teknologi token keamanan dari <strong>Supabase Auth Server</strong>.</li>
                <li><strong>Proteksi Lapisan PostgreSQL:</strong> Data rahasia alamat rumah, riwayat transaksi checkout pesanan, dan daftar keinginan (Wishlist) dikunci rapat menggunakan kebijakan Row Level Security (RLS) backend, mencegah kebocoran data ke pihak ketiga.</li>
                <li><strong>Penggunaan Informasi:</strong> Kontak alamat email Anda hanya digunakan oleh sistem untuk keperluan verifikasi identitas akun serta pelacakan resi kurir.</li>
              </ul>
            </div>
          )
        }

      default:
        return {
          title: 'PUSAT INFORMASI STARTUP REVIVO',
          subtitle: 'Temukan jawaban terbaik untuk kendala operasional gawai Anda.',
          body: <p>Silakan pilih menu informasi utama pada bagian bawah halaman web untuk membaca panduan regulasi marketplace kami.</p>
        }
    }
  }

  const data = getContentData()

  return (
    <StoreLayout isAuthenticated={isAuthenticated} onNavigate={onNavigate} showPromo={false}>
      <main className="jual-page" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 25px' }}>
        
        {/* HEADER HALAMAN DINAMIS */}
        <header className="jual-page__header" style={{ borderBottom: '2px solid #ff7f00', paddingBottom: '15px', marginBottom: '25px' }}>
          <h1 style={{ color: '#0d3b66', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            {data.title}
          </h1>
          <p style={{ color: '#718096', fontSize: '1.05rem', marginTop: '6px', fontStyle: 'italic' }}>
            {data.subtitle}
          </p>
        </header>
        
        {/* BADAN TEKS INFORMASI */}
        <section style={{ lineHeight: '1.7', color: '#2d3748', fontSize: '1.05rem' }}>
          {data.body}
        </section>

        {/* TOMBOL AKSI KEMBALI KETIKA SELESAI MEMBACA */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button 
            type="button" 
            className="button button--orange" 
            onClick={() => onNavigate('shop')}
            style={{ fontWeight: 'bold' }}
          >
            🛒 KEMBALI KE KATALOG TOKO
          </button>
        </div>

      </main>
    </StoreLayout>
  )
}

export default FooterContentPage