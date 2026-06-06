import { useEffect, useMemo, useState } from 'react'
import ProductCard from '../components/ProductCard.jsx'
import StoreLayout from '../components/StoreLayout.jsx'
import { shopCategories } from '../data/localData.js'
import { parsePriceValue } from '../utils/formatPrice.js'
// Import jembatan Supabase Client yang sudah kamu buat
import { supabase } from '../integrations/supabase/client.js'

const SORT_OPTIONS = [
  { id: 'popular', label: 'Populer' },
  { id: 'price-asc', label: 'Harga Terendah' },
  { id: 'price-desc', label: 'Harga Tertinggi' },
  { id: 'score', label: 'Kondisi Terbaik' },
]

function Shop({ isAuthenticated, onNavigate, initialCategory = 'all', initialSearch = '', listingsVersion = 0 }) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState('popular')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // State baru untuk menampung data dari Supabase dan status loading
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSearch(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    setCategory(initialCategory)
  }, [initialCategory])

  // AMBIL DATA DARI TABEL LISTINGS DAN CROSS-CHECK DENGAN WISHLIST CLOUD
  useEffect(() => {
    async function getLiveMarketplaceData() {
      setLoading(true)
      try {
        // 1. Ambil data produk listings aktif dari PostgreSQL
        const { data: listingsData, error } = await supabase
          .from('listings')
          .select('*')
          .in('status', ['available', 'active']) 
          .order('created_at', { ascending: false })

        if (error) throw error

        // 2. Ambil daftar barang yang difavoritkan oleh pengguna aktif jika sudah masuk sesi
        let wishlistedIds = []
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: wishData } = await supabase
            .from('wishlists')
            .select('listing_id')
            .eq('user_id', session.user.id)
          
          if (wishData) {
            wishlistedIds = wishData.map(w => w.listing_id)
          }
        }

        if (listingsData) {
          // Format skema kolom database agar cocok dengan properti yang dibaca ProductCard bawaan frontend
          const formattedData = listingsData.map((item) => ({
            id: item.id,
            name: item.name,          // Sesuai form.name
            category: item.category,  // Sesuai form.category
            priceValue: Number(item.price_value),
            price: `Rp ${Number(item.price_value).toLocaleString('id-ID')}`,
            oldPrice: item.old_price_value ? `Rp ${Number(item.old_price_value).toLocaleString('id-ID')}` : '',
            oldPriceValue: item.old_price_value ? Number(item.old_price_value) : 0,
            badge: item.badge,        // 'BEKAS' / 'REFURBISH'
            score: item.score,        // '85%', '90%', dll
            image: item.image_url || '/placeholder.svg',
            // 🌟 SUNTIKKAN PROPERTI BARU: Bernilai TRUE jika id produk ada di daftar wishlist pengguna
            isFav: wishlistedIds.includes(item.id) 
          }))
          setCatalog(formattedData)
        }
      } catch (err) {
        console.error('Gagal mengambil katalog dari Supabase:', err.message)
      } finally {
        setLoading(false)
      }
    }

    getLiveMarketplaceData()
  }, [listingsVersion])

  // Pembersihan fungsi hitung agar akurat dan aman dari bug 'undefined'
  const countLiveProductsByCategory = (catId) => {
    if (!catalog) return 0
    if (catId === 'all') return catalog.length
    
    // Melakukan pengecekan huruf kecil/besar (case-insensitive) agar aman dari kesalahan ketik di DB
    return catalog.filter(item => (item.category || '').toLowerCase() === catId.toLowerCase()).length
  }

  // LOGIKA MANIPULASI FILTER & SORTING (100% Menggunakan State Terkoneksi Supabase)
  const filtered = useMemo(() => {
    const min = parsePriceValue(minPrice)
    
    // Jika maxPrice kosong, otomatis gunakan fallback Infinity (Tak Terhingga) agar produk mahal lolos sensor
    const max = parsePriceValue(maxPrice) || Infinity
    const query = search.trim().toLowerCase()

    let list = catalog.filter((item) => {
      // Penyelarasan filter kategori siber (Pencocokan Huruf Kecil/Besar)
      const itemCat = (item.category || '').toLowerCase().trim()
      const selectedCat = category.toLowerCase().trim()

      const inCategory = selectedCat === 'all' || itemCat === selectedCat
      const inSearch = !query || item.name.toLowerCase().includes(query)
      const inPrice = item.priceValue >= min && item.priceValue <= max
      return inCategory && inSearch && inPrice
    })

    if (sort === 'price-asc') list = [...list].sort((a, b) => a.priceValue - b.priceValue)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.priceValue - a.priceValue)
    if (sort === 'score') {
      list = [...list].sort(
        (a, b) => parsePriceValue(b.score) - parsePriceValue(a.score),
      )
    }

    return list
  }, [catalog, category, search, sort, minPrice, maxPrice])

  const activeCategory = shopCategories.find((item) => item.id === category)

  return (
    <StoreLayout
      isAuthenticated={isAuthenticated}
      onNavigate={onNavigate}
      initialSearch={initialSearch}
    >
      <div className="shop-shell">
        <aside className="shop-sidebar" aria-label="Filter belanja">
          <section className="shop-filter-card">
            <h2>KATEGORI</h2>
            <ul>
              {shopCategories.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={category === item.id ? 'active' : ''}
                    onClick={() => setCategory(item.id)}
                  >
                    {item.label} ({countLiveProductsByCategory(item.id)})
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="shop-filter-card">
            <h2>HARGA</h2>
            <div className="shop-price-inputs">
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
                aria-label="Harga minimum"
              />
              <input
                type="number"
                // Mengubah placeholder agar informatif saat kosong
                placeholder="Tanpa Batas" 
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                aria-label="Harga maksimum"
              />
            </div>
            
            {/* Kondisional teks info agar memunculkan tulisan 'Tanpa Batas' jika state kosong */}
            <p className="shop-price-hint">
              Rp {Number(minPrice || 0).toLocaleString('id-ID')} - {' '}
              {maxPrice ? `Rp ${Number(maxPrice).toLocaleString('id-ID')}` : 'Tanpa Batas'}
            </p>
          </section>
        </aside>

        <section className="shop-main">
          <div className="shop-toolbar">
            <h1>{activeCategory?.label ?? 'Semua Produk'}</h1>
            <label className="shop-sort">
              <span>Urutkan:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Handler UI Kondisi Sesuai Keadaan Request Supabase Cloud */}
          {loading ? (
            <p className="shop-empty">Menyelaraskan data produk dengan server cloud REVIVO...</p>
          ) : filtered.length === 0 ? (
            <p className="shop-empty">Tidak ada produk yang cocok. Coba ubah filter atau kata kunci.</p>
          ) : (
            <div className="product-grid product-grid--shop">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(id) => onNavigate('product-detail', { productId: id })}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </StoreLayout>
  )
}

export default Shop